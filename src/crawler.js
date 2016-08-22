import EventEmitter from 'events';
import u from 'url';
import robotsParser from 'robots-parser';

import log from './log';
import Download from "./download";
import Parser from "./parser";
import Queue from './queue';
import Cache from './cache';

// Crawler
export default class extends EventEmitter {

    // Skip some common filetypes 'cause you never know whats out there (http://fileinfo.com/filetypes/common)
    _skipFiles = /jpg|jpeg|png|gif|bmp|tif|tiff|svg|pdf|wav|mpa|mp3|avi|flv|m4v|mov|mp4|mpg|swf|wmv|tar|gz|zip|rar|pkg|7z|xls|doc|log|odt|rtf|txt|exe|jar|com|bat/i;

    constructor(url, options = {}) {
        super(); // must

        // Set root url
        this._url = u.parse(url, true, true);

        // Delay
        this._delay = options.delay !== undefined ? options.delay : 5; // seconds

        // Use Queue to handle links
        this._queue = new Queue({ maxItems: options.maxItems, maxDepth: options.maxDepth });

        // Use Parser to get links and data
        this._parser = new Parser();

        // Use Cache to not handle an url more than once
        this._cache = new Cache();

    }

    // Start crawling!
    async start(target = {}) {
        log.debug('[crawler] start');
        log.silly(target);

        // Handle robots.txt
        await this._robot();

        // Handle delay
        Download.delay = this._delay;

        // Handle target
        this._mode = target.mode;
        this._path = target.path || '';
        this._link = target.link;
        this._skip = target.skip;
        this._page = target.page;
        this._rule = target.rule;

        let url = this._url.protocol + '//' + this._url.hostname + this._path;

        // Init queue and add entry point
        this._queue.init();
        this._queue.add(url);

        // Init cache and set entry point
        this._cache.init();
        this._cache.set(url);

        // Start crawling from queue
        return this._crawl();
    }

    // Recursive crawl urls from queue until queue is empty
    async _crawl() {
        const url = this._queue.get();
        if (url) {
            // Depth
            if (this._depth != this._queue.depth) {
                this._depth = this._queue.depth;
                log.verbose('[crawler] --- depth %s ---', this._queue.depth);
            }

            // Download
            let content = null;
            try {
                // Don't delay cached urls or first download
                if (Download.cache.has(url)) {
                    Download.delay = 0;
                } else if (!this._useDelay) { // _useDelay is used to check for first download (default undefined)
                    Download.delay = 0;
                    this._useDelay = true;
                } else {
                    Download.delay = this._delay;
                }

                content = await Download.get(url);
            } catch (err) {
                log.error(err);
            }

            // Get links and data
            if (content) {
                this._parser.html = content;

                // Get links and add to queue
                let links = this._getLinks();
                if (links) {
                    this._queue.add(links);
                }

                // Get data and tell 'handle-data' listeners about it
                let data = this._getData(url);
                if (data) {
                    this.emit('handle-data', data);
                }
            }

            // Check queue and continue or return
            if (this._queue.empty) {
                log.debug('[crawler] done');
                return;
            } else {
                return this._crawl();
            }
        }
    }

    // Get links for different modes
    _getLinks() {
        // Continue crawling?
        let getLinks = true;
        if (this._mode == 'fetch') {
            getLinks = false;
        } else if (this._mode == 'waterfall') {
            var index = this._queue.depth - 1;
            if (index == this._link.length) {
                getLinks = false;
            }
        }

        // Get links to crawl
        let links = null;
        if (getLinks) {

            // Handle link rules
            let link;
            if (this._mode == 'waterfall') {
                link = this._link[index];
            } else if (this._link) {
                link = this._link;
            }

            // Get links
            links = this._parser.getLinks(link, this._skip);
            log.debug('[crawler] %d links found', links.length);

            // Validate links
            links = this._validateLinks(links);
            log.debug('[crawler] %d links passed validation', links.length);
        }

        return links;
    }

    // Get data by parsing html
    _getData(url) {
        // Get data? Go through cases..
        let getData = false;
        if (this._mode == 'waterfall') {
            if (this._link.length + 1 === this._queue.depth) {
                getData = true;
            }
        } else if (this._page) {
            if (typeof this._page === 'string') {
                if (url.match(new RegExp(this._page))) {
                    getData = true;
                }
            } else {
                if (this._parser.find(this._page.elem)) {
                    getData = true;
                }
            }
        } else {
            getData = true;
        }

        let data;
        if (getData) {
            // Return parsed html if 'data' is defined in config or plain html of not
            data = this._rule ? this._parser.getData(this._rule) : this._parser.html;
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
            let url = u.parse(link, true, true); // https://nodejs.org/api/url.html#url_url_parse_urlstring_parsequerystring_slashesdenotehost

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

            // Remove #hash, ?utm_*, etc
            this._cleanUrl(url);

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

    // Remove #hask, ?utm_source=foobar, etc
    _cleanUrl(url) {
        // Remove #hash
        url.hash = null;

        // Remove utm_* from query
        url.search = null;
        let query = {};
        for (let prop in url.query) {
            if (!prop.match(/utm_/)) {
                query[prop] = url.query[prop];
            }
        }
        url.query = query;

        return u.parse(url.format(), true, true);
    }

    // Handle robots.txt
    async _robot() {
        if (this._robots) {
            return;
        }

        const url = this._url.format() + 'robots.txt';

        let content = null;
        try {
            content = await Download.get(url);
        } catch (err) {
            log.error(err);
        }

        if (content) {
            // Init robots parser
            this._robots = robotsParser(url, content);

            // Makes sure we are wanted
            if (this._robots.isDisallowed(this._url.format(), USER_AGENT)) {
                throw new Error('User-Agent not allowed by robots.txt')
            }

            // If robots spesifies delay and it is greater than ours, respect it!
            const delay = this._robots.getCrawlDelay();
            if (delay && delay > this._delay) {
                this._delay = delay;
            }
        } else {
            log.debug('[crawler] No robots.txt');
        }
    }

}
