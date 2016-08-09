'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _webCache = require('./web-cache');

var _webCache2 = _interopRequireDefault(_webCache);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function () {
    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        this._timeout = 60000;
        this._first = false;
    }

    (0, _createClass3.default)(_class, null, [{
        key: 'get',
        // used for delay

        value: function get(url, cookies) {
            var _this = this;

            if (cookies) {
                this._jar = _request2.default.jar();
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = (0, _getIterator3.default)(cookies), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var cookie = _step.value;

                        this._jar.setCookie(cookie, url);
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
            }

            if (this._cache && this._cache.has(url)) {
                _log2.default.verbose('[download] %s - CACHED ', url);
                return _promise2.default.resolve(this._cache.get(url));
            } else {
                return (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                    return _regenerator2.default.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    if (!_this._first) {
                                        _context.next = 6;
                                        break;
                                    }

                                    _log2.default.debug('[download] wait %s s', _this._delay);
                                    _context.next = 4;
                                    return new _promise2.default(function (resolve) {
                                        return setTimeout(resolve, _this._delay * 1000);
                                    });

                                case 4:
                                    _context.next = 7;
                                    break;

                                case 6:
                                    _this._first = true;

                                case 7:
                                    _log2.default.verbose('[download] %s', url);
                                    _context.next = 10;
                                    return _this._download(url);

                                case 10:
                                    return _context.abrupt('return', _context.sent);

                                case 11:
                                case 'end':
                                    return _context.stop();
                            }
                        }
                    }, _callee, _this);
                }))();
            }
        }
    }, {
        key: '_download',
        value: function _download(url) {
            var _this2 = this;

            var t0 = process.hrtime();
            var options = {
                url: url,
                headers: {
                    'User-Agent': USER_AGENT
                },
                gzip: true,
                timeout: this._timeout
            };
            if (this._jar) {
                options.jar = this._jar;
            }
            return new _promise2.default(function (resolve, reject) {
                (0, _request2.default)(options, function (error, response, content) {
                    if (error !== null) {
                        reject(error);
                    } else if (response.statusCode !== 200) {
                        reject('Error! Response code: ' + response.statusCode);
                    } else if (content) {
                        if (_this2._cache) {
                            _this2._cache.set(url, content);
                        }
                        var diff = process.hrtime(t0);
                        var time = (diff[0] + diff[1] * 1e-9).toFixed(2) + ' s';
                        var size = (response.socket.bytesRead / 1024).toFixed(2) + ' KB';
                        var gzip = response.headers['content-encoding'] == 'gzip';

                        _log2.default.silly(response.headers);
                        _log2.default.debug('[download] size: %s (%s)', size, gzip ? 'gzip' : 'uncompressed');
                        _log2.default.debug('[download] time: ' + time);
                        resolve(content);
                    } else {
                        reject('This should not happen');
                    }
                });
            });
        }
    }, {
        key: 'cookies',
        set: function set(c) {
            this._jar = _request2.default.jar();
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = (0, _getIterator3.default)(c), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var cookie = _step2.value;

                    this._jar.setCookie(cookie, url);
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
        }
    }, {
        key: 'timeout',
        set: function set(t) {
            this._timeout = t * 1000;
        }
    }, {
        key: 'cache',
        get: function get() {
            return this._cache;
        },
        set: function set(cache) {
            this._cache = cache;
        }
    }, {
        key: 'delay',
        set: function set(t) {
            this._delay = t;
        }
    }]);
    return _class;
}();

exports.default = _class;
//# sourceMappingURL=download.js.map