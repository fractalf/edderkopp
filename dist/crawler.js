'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _urijs = require('urijs');

var _urijs2 = _interopRequireDefault(_urijs);

var _robotsParser = require('robots-parser');

var _robotsParser2 = _interopRequireDefault(_robotsParser);

var _parser = require('./parser');

var _parser2 = _interopRequireDefault(_parser);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _queue = require('./queue');

var _queue2 = _interopRequireDefault(_queue);

var _download = require('./download');

var _download2 = _interopRequireDefault(_download);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
    function _class(conf) {
        _classCallCheck(this, _class);

        this.delay = 60;
        this.maxPages = 5;
        this.maxDepth = 2;
        this.skipFiles = /jpg|jpeg|png|gif|bmp|tif|tiff|svg|pdf|wav|mpa|mp3|avi|flv|m4v|mov|mp4|mpg|swf|wmv|tar|gz|zip|rar|pkg|7z|xls|doc|log|odt|rtf|txt|exe|jar|com|bat/i;

        this.cache = new _cache2.default();
        this.uri = new _urijs2.default(conf.url);
        this.uri.root = this.uri.protocol() + '://' + this.uri.hostname();
        this.pages = conf.pages;
        if (conf && conf.crawl) {
            for (var prop in conf.crawl) {
                this[prop] = conf.crawl[prop];
            }
        }
    }
    // Skip some common filetypes 'cause you never know whats out there (http://fileinfo.com/filetypes/common)
    // sec


    _createClass(_class, [{
        key: 'start',
        value: function start() {
            var _this = this;

            return new Promise(function (fulfill, reject) {

                // robots.txt
                var robotsFile = _this.uri.root + '/robots.txt';
                var robotsContent = _fs2.default.readFileSync(__dirname + '/../tmp/robots.txt').toString(); // tmp
                if (robotsContent) {
                    _this.robots = (0, _robotsParser2.default)(robotsFile, robotsContent);

                    // If robots spesifies delay and it is greater than ours, respect it!
                    var delay = _this.robots.getCrawlDelay();
                    if (delay && delay > _this.delay) {
                        _this.delay = delay;
                    }

                    // Makes sure we are wanted
                    if (!_this.robots.isAllowed(_this.uri.root, USER_AGENT)) {
                        reject('Stopped by robots.txt!');
                        return;
                    }
                }

                // Init queue
                _this.queue = new _queue2.default(_this.maxPages, _this.maxDepth);
                _this.queue.add(_this.uri.toString());

                // Cache main url
                _this.cache.set(_this.uri.toString());

                // Start crawling from queue
                _this._crawl().then(function () {
                    fulfill();
                });
            });
        }

        // Recursively crawl urls from queue
        // Promise pattern: https://gist.github.com/fractalf/c0eb369373d8fb1242ebb537e20e4794

    }, {
        key: '_crawl',
        value: function _crawl() {
            var _this2 = this;

            return new Promise(function (fulfill, reject) {
                var url = _this2.queue.get();
                if (url) {
                    _log2.default.verbose('[crawler] download: ' + url);
                    (0, _download2.default)(url).then(function (res) {
                        _log2.default.debug('[crawler] size: ' + res.size + (res.gzip ? ' (gzip)' : ' (uncompressed)'));
                        _log2.default.debug('[crawler] time: ' + res.time);

                        // Parse html
                        var parser = new _parser2.default(res.html);

                        // Get and validate all links and add to queue
                        var links = parser.getLinks();
                        _log2.default.debug('[crawler] validate ' + links.length + ' links');
                        links = _this2._validateLinks(links);
                        _log2.default.debug('[crawler] found ' + links.length + ' new links');
                        if (links.length) {
                            _this2.queue.add(links);
                        }

                        // #########################################################################
                        // TODO: Need to do something with the html document at hand!
                        // #########################################################################

                        // Crawl next in queue
                        if (!_this2.queue.isEmpty()) {
                            _log2.default.debug('[crawler] sleep ' + _this2.delay + ' s');
                            setTimeout(function () {
                                fulfill(true);
                            }, _this2.delay * 1000);
                        } else {
                            fulfill(false);
                        }
                    }).catch(function (e) {
                        _log2.default.error(e);
                    });
                }
            }).then(function (keepCrawling) {
                if (keepCrawling) {
                    return _this2._crawl();
                } else {
                    return;
                }
            }).catch(function (e) {
                _log2.default.error(e);
            });
        }
    }, {
        key: '_validateLinks',
        value: function _validateLinks(links) {
            var result = [];
            var uri = new _urijs2.default();
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = links[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var v = _step.value;

                    // Populate URI object
                    uri.href(v);

                    // Skip protocols other than http(s)
                    if (uri.protocol() && uri.protocol().indexOf('http') !== 0) {
                        _log2.default.silly('[crawler] Skip: unsupported protocol - ' + _url);
                        continue;
                    }

                    // Set host and skip different hosts
                    if (!uri.host()) {
                        uri.host(this.uri.host());
                    } else if (uri.host() != this.uri.host()) {
                        _log2.default.silly('[crawler] Skip: different host - ' + _url);
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
                    var _url = uri.toString();

                    // Skip handled links
                    if (this.cache.has(_url)) {
                        _log2.default.silly('[crawler] Skip: found in cache - ' + _url);
                        continue;
                    } else {
                        this.cache.set(_url);
                    }

                    // Skip certain file types
                    if (uri.suffix().match(this.skipFiles) !== null) {
                        _log2.default.silly('[crawler] Skip: file - ' + _url);
                        continue;
                    }

                    // Check robots.txt
                    if (this.robots && this.robots.isDisallowed(_url, USER_AGENT)) {
                        _log2.default.silly('[crawler] Skip: disallowed in robots.txt - ' + _url);
                        continue;
                    }

                    // Skip urls in config
                    if (this.skip.path) {
                        var skip = false;
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = this.skip.path[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var p = _step2.value;

                                if (uri.path().indexOf(p) === 0) {
                                    _log2.default.silly('[crawler] Skip: path - ' + _url);
                                    skip = true;
                                    continue;
                                }
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }

                        if (skip) {
                            continue;
                        }
                    }
                    result.push(_url);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            ;
            return result;
        }
    }]);

    return _class;
}();

exports.default = _class;