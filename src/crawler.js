import fs from 'fs';
import URI from 'urijs';
import robotsParser from 'robots-parser';
import Parser from "./parser";
import { logConsole as log } from './log';
import Queue from './queue';
import download from "./download";
import Cache from './cache';

export default class {

    delay = 60; // sec
    maxPages = 5;
    maxDepth = 2;
    // Skip some common filetypes 'cause you never know whats out there (http://fileinfo.com/filetypes/common)
    skipFiles = /jpg|jpeg|png|gif|bmp|tif|tiff|svg|pdf|wav|mpa|mp3|avi|flv|m4v|mov|mp4|mpg|swf|wmv|tar|gz|zip|rar|pkg|7z|xls|doc|log|odt|rtf|txt|exe|jar|com|bat/i;

    constructor(conf) {
        this.cache = new Cache();
        this.uri = new URI(conf.url);
        this.uri.root = this.uri.protocol() + '://' + this.uri.hostname()
        this.pages = conf.pages;
        if (conf && conf.crawl) {
            for (let prop in conf.crawl) {
                this[prop] = conf.crawl[prop];
            }
        }
    }

    start() {
        return new Promise((fulfill, reject) => {

            // robots.txt
            const robotsFile = this.uri.root + '/robots.txt';
            const robotsContent = fs.readFileSync(__dirname + '/../tmp/robots.txt').toString(); // tmp
            if (robotsContent) {
                this.robots = robotsParser(robotsFile, robotsContent);

                // If robots spesifies delay and it is greater than ours, respect it!
                const delay = this.robots.getCrawlDelay();
                if (delay && delay > this.delay) {
                    this.delay = delay;
                }

                // Makes sure we are wanted
                if (!this.robots.isAllowed(this.uri.root, USER_AGENT)) {
                    reject('Stopped by robots.txt!');
                    return;
                }
            }

            // Init queue
            this.queue = new Queue(this.maxPages, this.maxDepth);
            this.queue.add(this.uri.toString());

            // Cache main url
            this.cache.set(this.uri.toString());

            // Start crawling from queue
            this._crawl().then(() => {
                fulfill();
            });
        });
    }

    // Recursively crawl urls from queue
    // Promise pattern: https://gist.github.com/fractalf/c0eb369373d8fb1242ebb537e20e4794
    _crawl() {
        return new Promise((fulfill, reject) => {
            const url = this.queue.get();
            if (url) {
                log.verbose('[crawler] download: ' + url);
                download(url).then((res) => {
                    log.debug('[crawler] size: ' + res.size + (res.gzip ? ' (gzip)' : ' (uncompressed)'));
                    log.debug('[crawler] time: ' + res.time);

                    // Parse html
                    const parser = new Parser(res.html);

                    // Get and validate all links and add to queue
                    let links = parser.getLinks();
                    log.debug('[crawler] validate ' + links.length + ' links');
                    links = this._validateLinks(links);
                    log.debug('[crawler] found ' + links.length + ' new links');
                    if (links.length) {
                        this.queue.add(links);
                    }

                    // #########################################################################
                    // TODO: Need to do something with the html document at hand!
                    // #########################################################################

                    // Crawl next in queue
                    if (!this.queue.isEmpty()) {
                        log.debug('[crawler] sleep ' + this.delay + ' s');
                        setTimeout(() => {
                            fulfill(true);
                        }, this.delay * 1000);
                    } else {
                        fulfill(false);
                    }
                }).catch((e) => {
                    log.error(e);
                })
            }
        })
        .then((keepCrawling) => {
            if (keepCrawling) {
                return this._crawl();
            } else {
                return;
            }
        })
        .catch((e) => {
            log.error(e);
        });
    }


    _validateLinks(links) {
        let result = [];
        let uri = new URI();
        for (let v of links) {
            // Populate URI object
            uri.href(v);

            // Skip protocols other than http(s)
            if (uri.protocol() && uri.protocol().indexOf('http') !== 0) {
                log.silly('[crawler] Skip: unsupported protocol - ' + url);
                continue;
            }

            // Set host and skip different hosts
            if (!uri.host()) {
                uri.host(this.uri.host());
            } else if (uri.host() != this.uri.host()) {
                log.silly('[crawler] Skip: different host - ' + url);
                continue;
            }

            // Force protocol to same as this.uri
            uri.protocol(this.uri.protocol());

            // Normalize
            uri.normalize();

            // Remove trailing slash
            uri.path(uri.path().replace(/\/$/, ""));

            // Remove #anchor
            uri.hash('');

            // Build url
            let url = uri.toString();

            // Skip handled links
            if (this.cache.has(url)) {
                log.silly('[crawler] Skip: found in cache - ' + url);
                continue;
            } else {
                this.cache.set(url);
            }

            // Skip certain file types
            if (uri.suffix().match(this.skipFiles) !== null) {
                log.silly('[crawler] Skip: file - ' + url);
                continue;
            }

            // Check robots.txt
            if (this.robots && this.robots.isDisallowed(url, USER_AGENT)) {
                log.silly('[crawler] Skip: disallowed in robots.txt - ' + url);
                continue;
            }

            // Skip urls in config
            if (this.skip.path) {
                let skip = false;
                for (let p of this.skip.path) {
                    if (uri.path().indexOf(p) === 0) {
                        log.silly('[crawler] Skip: path - ' + url);
                        skip = true;
                        continue;
                    }
                }
                if (skip) { continue; }
            }
            result.push(url);
        };
        return result;
    }

}
