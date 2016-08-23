'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

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

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Crawler = function (_EventEmitter) {
    (0, _inherits3.default)(Crawler, _EventEmitter);

    function Crawler(url) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        (0, _classCallCheck3.default)(this, Crawler);

        // must

        // Set root url
        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Crawler).call(this));

        _this._skipFiles = /jpg|jpeg|png|gif|bmp|tif|tiff|svg|pdf|wav|mpa|mp3|avi|flv|m4v|mov|mp4|mpg|swf|wmv|tar|gz|zip|rar|pkg|7z|xls|doc|log|odt|rtf|txt|exe|jar|com|bat/i;
        _this._url = _url2.default.parse(url, true, true);

        // Delay
        _this._delay = options.delay !== undefined ? options.delay : 5; // seconds

        // Use Queue to handle links
        _this._queue = new _queue2.default({ maxItems: options.maxItems, maxDepth: options.maxDepth });
        return _this;
    }

    // Start crawling!


    // Skip some common filetypes 'cause you never know whats out there (http://fileinfo.com/filetypes/common)


    (0, _createClass3.default)(Crawler, [{
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

                                // Handle delay
                                _download2.default.delay = this._delay;

                                // Handle target
                                this._mode = target.mode;
                                this._path = target.path || '';
                                this._link = target.link;
                                this._skip = target.skip;
                                this._page = target.page;
                                this._rule = target.rule;

                                url = this._url.protocol + '//' + this._url.hostname + this._path;

                                // Init queue and add entry point

                                this._queue.init();
                                this._queue.add(url);

                                // Init visited (used so we don't crawl same url more than once)
                                this._visited = {};
                                this._visited[url] = true;

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
                var url, content, links, data;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                url = this._queue.get();

                                if (!url) {
                                    _context2.next = 21;
                                    break;
                                }

                                // Depth
                                if (this._depth != this._queue.depth) {
                                    this._depth = this._queue.depth;
                                    _log2.default.verbose('[crawler] --- depth %s ---', this._queue.depth);
                                }

                                // Download
                                content = null;
                                _context2.prev = 4;

                                // Don't delay cached urls or first download
                                if (_download2.default.cache.has(url)) {
                                    _download2.default.delay = 0;
                                } else if (!this._useDelay) {
                                    // _useDelay is used to check for first download (default undefined)
                                    _download2.default.delay = 0;
                                    this._useDelay = true;
                                } else {
                                    _download2.default.delay = this._delay;
                                }

                                _context2.next = 8;
                                return _download2.default.get(url);

                            case 8:
                                content = _context2.sent;
                                _context2.next = 14;
                                break;

                            case 11:
                                _context2.prev = 11;
                                _context2.t0 = _context2['catch'](4);

                                _log2.default.error(_context2.t0);

                            case 14:

                                // Get links and data
                                if (content) {
                                    _parser2.default.html = content;

                                    // Get links and add to queue
                                    links = this._getLinks();

                                    if (links) {
                                        this._queue.add(links);
                                    }

                                    // Get data and tell 'handle-data' listeners about it
                                    data = this._getData(url);

                                    if (data) {
                                        this.emit('handle-data', data);
                                    }
                                }

                                // Check queue and continue or return

                                if (!this._queue.empty) {
                                    _context2.next = 20;
                                    break;
                                }

                                _log2.default.debug('[crawler] done');
                                return _context2.abrupt('return');

                            case 20:
                                return _context2.abrupt('return', this._crawl());

                            case 21:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[4, 11]]);
            }));

            function _crawl() {
                return _ref2.apply(this, arguments);
            }

            return _crawl;
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
                if (index == this._link.length) {
                    getLinks = false;
                }
            }

            // Get links to crawl
            var links = null;
            if (getLinks) {

                // Handle link rules
                var link = void 0;
                if (this._mode == 'waterfall') {
                    link = this._link[index];
                } else if (this._link) {
                    link = this._link;
                }

                // Get links
                links = _parser2.default.getLinks(link, this._skip);
                _log2.default.debug('[crawler] %d links found', links.length);

                // Validate links
                links = this._validateLinks(links);
                _log2.default.debug('[crawler] %d links passed validation', links.length);
            }

            return links;
        }

        // Get data by parsing html

    }, {
        key: '_getData',
        value: function _getData(url) {
            // Get data? Go through cases..
            var getData = false;
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
                    if (_parser2.default.find(this._page.elem)) {
                        getData = true;
                    }
                }
            } else {
                getData = true;
            }

            var data = void 0;
            if (getData) {
                // Return parsed html if 'data' is defined in config or plain html of not
                data = this._rule ? _parser2.default.getData(this._rule) : _parser2.default.html;
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
                    var url = _url2.default.parse(link, true, true); // https://nodejs.org/api/url.html#url_url_parse_urlstring_parsequerystring_slashesdenotehost

                    // Skip protocols other than http(s) (mailto, ftp, ..)
                    if (url.protocol && url.protocol.indexOf('http') !== 0) {
                        _log2.default.silly('[crawler] Skip: ' + link + ' (unsupported protocol)');
                        continue;
                    }

                    if (!url.hostname) {
                        // Set host if empty
                        url.hostname = this._url.hostname;
                    } else if (url.hostname != this._url.hostname) {
                        // Skip different/external hosts
                        _log2.default.silly('[crawler] Skip: ' + link + ' (different host)');
                        continue;
                    }

                    if (url.pathname) {
                        // Skip certain file types
                        var matches = url.pathname.match(/\.(\w{2,4})$/);
                        if (matches) {
                            if (matches[1].match(this._skipFiles) !== null) {
                                _log2.default.silly('[crawler] Skip: ' + link + ' (file type)');
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
                    var urlString = url.format();

                    // Skip handled links
                    if (this._visited[urlString]) {
                        _log2.default.silly('[crawler] Skip: ' + link + ' (already visited)');
                        continue;
                    } else {
                        this._visited[urlString] = true;
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

        // Remove #hask, ?utm_source=foobar, etc

    }, {
        key: '_cleanUrl',
        value: function _cleanUrl(url) {
            // Remove #hash
            url.hash = null;

            // Remove utm_* from query
            url.search = null;
            var query = {};
            for (var prop in url.query) {
                if (!prop.match(/utm_/)) {
                    query[prop] = url.query[prop];
                }
            }
            url.query = query;

            return _url2.default.parse(url.format(), true, true);
        }

        // Handle robots.txt

    }, {
        key: '_robot',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
                var url, content, delay;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                if (!this._robots) {
                                    _context3.next = 2;
                                    break;
                                }

                                return _context3.abrupt('return');

                            case 2:
                                url = this._url.format() + 'robots.txt';
                                content = null;
                                _context3.prev = 4;
                                _context3.next = 7;
                                return _download2.default.get(url);

                            case 7:
                                content = _context3.sent;
                                _context3.next = 13;
                                break;

                            case 10:
                                _context3.prev = 10;
                                _context3.t0 = _context3['catch'](4);

                                _log2.default.error(_context3.t0);

                            case 13:
                                if (!content) {
                                    _context3.next = 21;
                                    break;
                                }

                                // Init robots parser
                                this._robots = (0, _robotsParser2.default)(url, content);

                                // Makes sure we are wanted

                                if (!this._robots.isDisallowed(this._url.format(), USER_AGENT)) {
                                    _context3.next = 17;
                                    break;
                                }

                                throw new Error('User-Agent not allowed by robots.txt');

                            case 17:

                                // If robots spesifies delay and it is greater than ours, respect it!
                                delay = this._robots.getCrawlDelay();

                                if (delay && delay > this._delay) {
                                    this._delay = delay;
                                }
                                _context3.next = 22;
                                break;

                            case 21:
                                _log2.default.debug('[crawler] No robots.txt');

                            case 22:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[4, 10]]);
            }));

            function _robot() {
                return _ref3.apply(this, arguments);
            }

            return _robot;
        }()
    }]);
    return Crawler;
}(_events2.default);

exports.default = Crawler;
//# sourceMappingURL=crawler.js.map