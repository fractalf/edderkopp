import EventEmitter from 'events';
import fs from 'fs';
import u from 'url';
import robotsParser from 'robots-parser';

import log from './log';
import download from "./download";
import Parser from "./parser";
import Queue from './queue';
import WebCache from './web-cache';
import Cache from './cache';

// Crawler
export default class extends EventEmitter {

    // Skip some common filetypes 'cause you never know whats out there (http://fileinfo.com/filetypes/common)
    skipFiles = /jpg|jpeg|png|gif|bmp|tif|tiff|svg|pdf|wav|mpa|mp3|avi|flv|m4v|mov|mp4|mpg|swf|wmv|tar|gz|zip|rar|pkg|7z|xls|doc|log|odt|rtf|txt|exe|jar|com|bat/i;

    constructor(url, options = {}) {
        super(); // must

        // Set root url
        this._url = u.parse(url, true, true);

        // Use Queue to handle links
        this._queue = new Queue({ maxItems: options.maxItems, maxDepth: options.maxDepth });

        // Use Parser to get links and data
        this._parser = new Parser();

        // Use Cache to not handle an url more than once
        this._cache = new Cache();

        // Use WebCache to cache html and save unnecessary downloads
        if (options.cache) {
            this._wc = new WebCache();
        }

        // Handle robots.txt
        this._robot();

        // Handle options
        this._delay = options.delay !== undefined ? options.delay : 5; // seconds
        this._maxItems = options.maxItems !== undefined ? options.maxItems : 5;
        this._maxDepth = options.maxDepth !== undefined ? options.maxDepth : 2;
        this._download = options.download;
    }

    // Start crawling!
    start(target = {}) {

        // Handle target
        this._mode = target.mode;
        this._path = target.path || '';
        this._follow = target.follow;
        this._skip = target.skip;
        this._find = target.find;
        this._get = target.get;

        let url = u.resolve(this._url, this._path);

        // Init queue and add entry point
        this._queue.init();
        this._queue.add(url);

        // Init cache and set entry point
        this._cache.init();
        this._cache.set(url);

        // Don't wait on first download
        this._wait = false;

        // Start crawling from queue
        return this._crawl();
    }

    // Recursive crawl urls from queue until queue is empty
    async _crawl() {
        const url = this._queue.get();
        if (url) {
            let html = await this._getHtml(url);
            if (html) {
                this._parser.html = html;

                // Get links and add to queue
                let links = this._getLinks();
                if (links) {
                    this._queue.add(links);
                }

                // Get data and tell 'found-data' listeners about it
                let data = this._getData();
                if (data) {
                    this.emit('found-data', data);
                }
            }
            return this._queue.empty ? null : this._crawl();
        }
    }

    // Get html from cache or download
    async _getHtml(url) {
        let html = this._wc && !this._download ? this._wc.get(url) : false;
        if (html !== false) {
            log.verbose('[crawler] %s: %s (cached) ', this._queue.depth, url);
            if (html === null) { // if 404..
                log.error('No html (404?)');
            }
        } else {
            // Wait between each download, but not the first
            if (this._wait) {
                log.debug('[crawler] sleep %s s', this._delay);
                await new Promise(resolve => setTimeout(resolve, this._delay * 1000));
            } else {
                this._wait = true;
            }

            // Download
            log.verbose('[crawler] %s: %s', this._queue.depth, url);
            try {
                var res = await download(url);
                log.silly(res.headers);
                log.debug('[crawler] size: %s (%s)', res.size, res.gzip ? 'gzip' : 'uncompressed');
                log.debug('[crawler] time: ' + res.time);
                html = res.html;
            } catch (err) {
                log.error(err);
                html = null;
            }
            if (this._wc) {
                this._wc.set(url, html);
            }
        }
        return html;
    }

    // Get links for different modes
    _getLinks() {
        // Continue crawling?
        let getLinks = true;
        if (this._mode == 'fetch') {
            getLinks = false;
        } else if (this._mode == 'waterfall') {
            var index = this._queue.depth - 1;
            if (index == this._follow.length) {
                getLinks = false;
            }
        }

        // Get links to crawl
        let links;
        if (getLinks) {

            // Handle follow rules
            let follow;
            if (this._mode == 'waterfall') {
                follow = this._follow[index];
            } else if (this._follow) {
                follow = this._follow;
            }

            // Get links
            links = this._parser.getLinks(follow, this._skip);
            log.debug('[crawler] %d links found', links.length);

            // Validate links
            links = this._validateLinks(links);
            log.debug('[crawler] %d links passed validation', links.length);
        }

        return links && links.length ? links : false;
    }

    // Get data by parsing html
    _getData() {
        // Get data? Go through cases..
        let getData = false;
        if (this._mode == 'waterfall') {
            if (this._follow.length + 1 === this._queue.depth) {
                getData = true;
            }
        } else if (this._find) {
            if (typeof this._find === 'string') {
                if (url.match(new RegExp(this._find))) {
                    getData = true;
                }
            } else {
                if (this._parser.find(this._find.elem)) {
                    getData = true;
                }
            }
        } else {
            getData = true;
        }

        let data;
        if (getData) {
            // Return parsed html if "get" is defined in config, else plain html
            if (this._get) {
                data = {};
                for (let prop in this._get) {
                    data[prop] = this._parser.getData(this._get[prop])
                }
            } else {
                data = this._parser.html;
            }
        } else {
            data = false;
        }

        return data;
    }

    // Validate links
    _validateLinks(links) {
        let result = [];
        // let uri = new URI();
        for (let link of links) {
            // Populate url object
            let url = u.parse(link, false, true); // https://nodejs.org/api/url.html#url_url_parse_urlstring_parsequerystring_slashesdenotehost

            // Skip protocols other than http(s) (mailto, ftp, ..)
            if (url.protocol && url.protocol.indexOf('http') !== 0) {
                log.silly('[crawler] Skip: ' + link + ' (unsupported protocol)');
                continue;
            }

            if (!url.hostname) {
                // Set host if empty
                url.hostname = this._url.hostname;
            } else if (url.hostname != this._url.hostname) {
                // Skip different/external hosts
                log.silly('[crawler] Skip: ' + link + ' (different host)');
                continue;
            }

            if (url.pathname) {
                // Skip certain file types
                let matches = url.pathname.match(/\.(\w{2,4})$/);
                if (matches) {
                    if (matches[1].match(this._skipFiles) !== null) {
                        log.silly('[crawler] Skip: ' + link + ' (file type)');
                        continue;
                    }
                }

                // Remove trailing slash (questionable, this can be improved?)
                url.pathname = url.pathname.replace(/\/$/, '');
            }

            // Force protocol to same as this._url
            url.protocol = this._url.protocol;

            // Remove #hash
            url.hash = null;

            // Build url
            let urlString = url.format();

            // Skip handled links
            if (this._cache.has(urlString)) {
                log.silly('[crawler] Skip: ' + link + ' (found in cache)');
                continue;
            } else {
                this._cache.set(urlString);
            }

            // Check robots.txt
            if (this._robots && this._robots.isDisallowed(urlString, USER_AGENT)) {
                log.silly('[crawler] Skip: ' + link + ' (disallowed in robots.txt)');
                continue;
            }

            log.silly('[crawler] New:  ' + link);
            result.push(urlString);
        };
        return result;
    }

    // Handle robots.txt
    _robot() {
        const robotsFile = this._url.format() + 'robots.txt';
        const robotsContent = fs.readFileSync(__dirname + '/../tmp/robots.txt').toString(); // tmp
        if (robotsContent) {
            this._robots = robotsParser(robotsFile, robotsContent);

            // If robots spesifies delay and it is greater than ours, respect it!
            const delay = this._robots.getCrawlDelay();
            if (delay && delay > this._delay) {
                this._delay = delay;
            }

            // Makes sure we are wanted
            if (!this._robots.isAllowed(this._url.format(), USER_AGENT)) {
                throw new Error('User-Agent not allowed by robots.txt')
            }
        }
    }

}
