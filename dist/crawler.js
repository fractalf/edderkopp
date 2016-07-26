'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _url2 = require('url');

var _url3 = _interopRequireDefault(_url2);

var _robotsParser = require('robots-parser');

var _robotsParser2 = _interopRequireDefault(_robotsParser);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _download = require('./download');

var _download2 = _interopRequireDefault(_download);

var _parser = require('./parser');

var _parser2 = _interopRequireDefault(_parser);

var _queue = require('./queue');

var _queue2 = _interopRequireDefault(_queue);

var _webCache = require('./web-cache');

var _webCache2 = _interopRequireDefault(_webCache);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Crawler
var _class = function (_EventEmitter) {
    (0, _inherits3.default)(_class, _EventEmitter);

    function _class(url) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        (0, _classCallCheck3.default)(this, _class);

        // must

        // Set root url
        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(_class).call(this));

        _this.skipFiles = /jpg|jpeg|png|gif|bmp|tif|tiff|svg|pdf|wav|mpa|mp3|avi|flv|m4v|mov|mp4|mpg|swf|wmv|tar|gz|zip|rar|pkg|7z|xls|doc|log|odt|rtf|txt|exe|jar|com|bat/i;
        _this._url = _url3.default.parse(url, true, true);

        // Use Queue to handle links
        _this._queue = new _queue2.default({ maxItems: options.maxItems, maxDepth: options.maxDepth });

        // Use Parser to get links and data
        _this._parser = new _parser2.default();

        // Use Cache to not handle an url more than once
        _this._cache = new _cache2.default();

        // Use WebCache to cache html and save unnecessary downloads
        if (options.cache) {
            _this._wc = new _webCache2.default();
        }

        // Handle options
        _this._delay = options.delay !== undefined ? options.delay : 5; // seconds
        _this._maxItems = options.maxItems !== undefined ? options.maxItems : 5;
        _this._maxDepth = options.maxDepth !== undefined ? options.maxDepth : 2;
        _this._download = options.download;
        return _this;
    }

    // Start crawling!


    // Skip some common filetypes 'cause you never know whats out there (http://fileinfo.com/filetypes/common)


    (0, _createClass3.default)(_class, [{
        key: 'start',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                var target = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
                var url;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _log2.default.debug('[crawler] start');
                                _log2.default.silly(target);

                                // Handle robots.txt
                                _context.next = 4;
                                return this._robot();

                            case 4:

                                // Handle target
                                this._mode = target.mode;
                                this._path = target.path || '';
                                this._follow = target.follow;
                                this._skip = target.skip;
                                this._find = target.find;
                                this._get = target.get;

                                url = _url3.default.resolve(this._url, this._path);

                                // Init queue and add entry point

                                this._queue.init();
                                this._queue.add(url);

                                // Init cache and set entry point
                                this._cache.init();
                                this._cache.set(url);

                                // Don't wait on first download
                                this._wait = false;

                                // Start crawling from queue
                                return _context.abrupt('return', this._crawl());

                            case 17:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function start(_x2) {
                return _ref.apply(this, arguments);
            }

            return start;
        }()

        // Recursive crawl urls from queue until queue is empty

    }, {
        key: '_crawl',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
                var url, html, links, data;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                url = this._queue.get();

                                if (!url) {
                                    _context2.next = 12;
                                    break;
                                }

                                _context2.next = 4;
                                return this._getHtml(url);

                            case 4:
                                html = _context2.sent;

                                if (html) {
                                    this._parser.html = html;

                                    // Get links and add to queue
                                    links = this._getLinks();

                                    if (links) {
                                        this._queue.add(links);
                                    }

                                    // Get data and tell 'found-data' listeners about it
                                    data = this._getData();

                                    if (data) {
                                        this.emit('found-data', data);
                                    }
                                }

                                if (!this._queue.empty) {
                                    _context2.next = 11;
                                    break;
                                }

                                _log2.default.debug('[crawler] done');
                                return _context2.abrupt('return');

                            case 11:
                                return _context2.abrupt('return', this._crawl());

                            case 12:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function _crawl() {
                return _ref2.apply(this, arguments);
            }

            return _crawl;
        }()

        // Get html from cache or download

    }, {
        key: '_getHtml',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(url) {
                var _this2 = this;

                var html, res;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                html = this._wc && !this._download ? this._wc.get(url) : false;

                                if (!(html !== false)) {
                                    _context3.next = 6;
                                    break;
                                }

                                _log2.default.verbose('[crawler] %s: %s - CACHED ', this._queue.depth, url);
                                if (html === null) {
                                    // if 404..
                                    _log2.default.error('No html (404?)');
                                }
                                _context3.next = 29;
                                break;

                            case 6:
                                if (!this._wait) {
                                    _context3.next = 12;
                                    break;
                                }

                                _log2.default.debug('[crawler] sleep %s s', this._delay);
                                _context3.next = 10;
                                return new _promise2.default(function (resolve) {
                                    return setTimeout(resolve, _this2._delay * 1000);
                                });

                            case 10:
                                _context3.next = 13;
                                break;

                            case 12:
                                this._wait = true;

                            case 13:

                                // Download
                                _log2.default.verbose('[crawler] %s: %s', this._queue.depth, url);
                                _context3.prev = 14;
                                _context3.next = 17;
                                return (0, _download2.default)(url);

                            case 17:
                                res = _context3.sent;

                                _log2.default.silly(res.headers);
                                _log2.default.debug('[crawler] size: %s (%s)', res.size, res.gzip ? 'gzip' : 'uncompressed');
                                _log2.default.debug('[crawler] time: ' + res.time);
                                html = res.html;
                                _context3.next = 28;
                                break;

                            case 24:
                                _context3.prev = 24;
                                _context3.t0 = _context3['catch'](14);

                                _log2.default.error(_context3.t0);
                                html = null;

                            case 28:
                                if (this._wc) {
                                    this._wc.set(url, html);
                                }

                            case 29:
                                return _context3.abrupt('return', html);

                            case 30:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[14, 24]]);
            }));

            function _getHtml(_x4) {
                return _ref3.apply(this, arguments);
            }

            return _getHtml;
        }()

        // Get links for different modes

    }, {
        key: '_getLinks',
        value: function _getLinks() {
            // Continue crawling?
            var getLinks = true;
            if (this._mode == 'fetch') {
                getLinks = false;
            } else if (this._mode == 'waterfall') {
                var index = this._queue.depth - 1;
                if (index == this._follow.length) {
                    getLinks = false;
                }
            }

            // Get links to crawl
            var links = void 0;
            if (getLinks) {

                // Handle follow rules
                var follow = void 0;
                if (this._mode == 'waterfall') {
                    follow = this._follow[index];
                } else if (this._follow) {
                    follow = this._follow;
                }

                // Get links
                links = this._parser.getLinks(follow, this._skip);
                _log2.default.debug('[crawler] %d links found', links.length);

                // Validate links
                links = this._validateLinks(links);
                _log2.default.debug('[crawler] %d links passed validation', links.length);
            }

            return links && links.length ? links : false;
        }

        // Get data by parsing html

    }, {
        key: '_getData',
        value: function _getData() {
            // Get data? Go through cases..
            var getData = false;
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

            var data = void 0;
            if (getData) {
                // Return parsed html if "get" is defined in config, else plain html
                if (this._get) {
                    data = {};
                    for (var prop in this._get) {
                        data[prop] = this._parser.getData(this._get[prop]);
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

    }, {
        key: '_validateLinks',
        value: function _validateLinks(links) {
            var result = [];
            // let uri = new URI();
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)(links), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var link = _step.value;

                    // Populate url object
                    var _url = _url3.default.parse(link, false, true); // https://nodejs.org/api/url.html#url_url_parse_urlstring_parsequerystring_slashesdenotehost

                    // Skip protocols other than http(s) (mailto, ftp, ..)
                    if (_url.protocol && _url.protocol.indexOf('http') !== 0) {
                        _log2.default.silly('[crawler] Skip: ' + link + ' (unsupported protocol)');
                        continue;
                    }

                    if (!_url.hostname) {
                        // Set host if empty
                        _url.hostname = this._url.hostname;
                    } else if (_url.hostname != this._url.hostname) {
                        // Skip different/external hosts
                        _log2.default.silly('[crawler] Skip: ' + link + ' (different host)');
                        continue;
                    }

                    if (_url.pathname) {
                        // Skip certain file types
                        var matches = _url.pathname.match(/\.(\w{2,4})$/);
                        if (matches) {
                            if (matches[1].match(this._skipFiles) !== null) {
                                _log2.default.silly('[crawler] Skip: ' + link + ' (file type)');
                                continue;
                            }
                        }

                        // Remove trailing slash (questionable, this can be improved?)
                        _url.pathname = _url.pathname.replace(/\/$/, '');
                    }

                    // Force protocol to same as this._url
                    _url.protocol = this._url.protocol;

                    // Remove #hash
                    _url.hash = null;

                    // Build url
                    var urlString = _url.format();

                    // Skip handled links
                    if (this._cache.has(urlString)) {
                        _log2.default.silly('[crawler] Skip: ' + link + ' (found in cache)');
                        continue;
                    } else {
                        this._cache.set(urlString);
                    }

                    // Check robots.txt
                    if (this._robots && this._robots.isDisallowed(urlString, USER_AGENT)) {
                        _log2.default.silly('[crawler] Skip: ' + link + ' (disallowed in robots.txt)');
                        continue;
                    }

                    _log2.default.silly('[crawler] New:  ' + link);
                    result.push(urlString);
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

        // Handle robots.txt

    }, {
        key: '_robot',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
                var url, content, res, delay;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                if (!this._robots) {
                                    _context4.next = 2;
                                    break;
                                }

                                return _context4.abrupt('return');

                            case 2:
                                url = this._url.format() + 'robots.txt';
                                content = this._wc && !this._download ? this._wc.get(url) : false;

                                if (!(content !== false)) {
                                    _context4.next = 9;
                                    break;
                                }

                                _log2.default.verbose('[crawler] %s - CACHED', url);
                                if (content === null) {
                                    _log2.default.warn('No robots.txt');
                                }
                                _context4.next = 22;
                                break;

                            case 9:
                                _log2.default.verbose('[crawler] ' + url);
                                _context4.prev = 10;
                                _context4.next = 13;
                                return (0, _download2.default)(url);

                            case 13:
                                res = _context4.sent;

                                content = res.html;
                                _context4.next = 21;
                                break;

                            case 17:
                                _context4.prev = 17;
                                _context4.t0 = _context4['catch'](10);

                                _log2.default.error(_context4.t0);
                                content = null;

                            case 21:
                                if (this._wc) {
                                    this._wc.set(url, content);
                                }

                            case 22:
                                if (!content) {
                                    _context4.next = 28;
                                    break;
                                }

                                this._robots = (0, _robotsParser2.default)(url, content);

                                // If robots spesifies delay and it is greater than ours, respect it!
                                delay = this._robots.getCrawlDelay();

                                if (delay && delay > this._delay) {
                                    this._delay = delay;
                                }

                                // Makes sure we are wanted

                                if (this._robots.isAllowed(this._url.format(), USER_AGENT)) {
                                    _context4.next = 28;
                                    break;
                                }

                                throw new Error('User-Agent not allowed by robots.txt');

                            case 28:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this, [[10, 17]]);
            }));

            function _robot() {
                return _ref4.apply(this, arguments);
            }

            return _robot;
        }()
    }]);
    return _class;
}(_events2.default);

exports.default = _class;
//# sourceMappingURL=crawler.js.map