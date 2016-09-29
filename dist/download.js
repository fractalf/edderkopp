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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Download = function () {
    // delay 2-5 sec (simulate a user)
    function Download(options) {
        (0, _classCallCheck3.default)(this, Download);
        this._timeout = 60000;
        this._cache = false;
        this._delay = [2, 5];
        this._force = false;
        this._followRedirect = true;

        if (options.timeout !== undefined) {
            this._timeout = options.timeout;
        }
        if (options.delay !== undefined) {
            this._delay = options.delay;
        }
        if (options.cache !== undefined) {
            this._cache = options.cache;
        }
        if (options.force !== undefined) {
            this._force = options.force;
        }
        if (options.followRedirect !== undefined) {
            this._followRedirect = options.followRedirect;
        }
    }

    (0, _createClass3.default)(Download, [{
        key: 'get',
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

            // Get from cache or download it?
            if (this._cache && !this._force && this._cache.has(url)) {
                var res = {
                    content: this._cache.get(url),
                    cached: true
                };
                return _promise2.default.resolve(res);
            } else {
                return (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                    var delay, options, res;
                    return _regenerator2.default.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    delay = 0;

                                    if (!_this._useDelay) {
                                        _context.next = 7;
                                        break;
                                    }

                                    delay = !Array.isArray(_this._delay) ? _this._delay : _this._delay[0] + (_this._delay[1] - _this._delay[0]) * Math.random();
                                    _context.next = 5;
                                    return new _promise2.default(function (resolve) {
                                        return setTimeout(resolve, delay * 1000);
                                    });

                                case 5:
                                    _context.next = 8;
                                    break;

                                case 7:
                                    // Don't delay first download
                                    _this._useDelay = true;

                                case 8:

                                    // Prepare options for request
                                    options = {
                                        url: url,
                                        headers: {
                                            'User-Agent': USER_AGENT
                                        },
                                        followRedirect: _this._followRedirect,
                                        gzip: true,
                                        timeout: _this._timeout
                                    };

                                    if (_this._jar) {
                                        options.jar = _this._jar;
                                    }
                                    _context.next = 12;
                                    return _this._download(options);

                                case 12:
                                    res = _context.sent;

                                    res.delay = delay;
                                    return _context.abrupt('return', res);

                                case 15:
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
        value: function _download(options) {
            var _this2 = this;

            return new _promise2.default(function (resolve, reject) {
                var t0 = process.hrtime();
                (0, _request2.default)(options, function (error, response, content) {
                    if (error !== null) {
                        reject(error);
                    }
                    // Note: the strange 301|302 condition is for the very weird case where a site returns a 301|302
                    // with the correct content! Then we don't want to follow redirect, just return the body.
                    else if (response.statusCode === 200 || /30[12]/.test(response.statusCode) && !_this2._followRedirect) {
                            // Debug info
                            var diff = process.hrtime(t0);
                            var time = diff[0] + diff[1] * 1e-9;

                            if (_this2._cache) {
                                _this2._cache.set(options.url, content);
                            }
                            resolve({ statusCode: response.statusCode, headers: response.headers, content: content, time: time });
                        } else {
                            reject('Response code: ' + response.statusCode);
                        }
                });
            });
        }
    }]);
    return Download;
}();

exports.default = Download;
//# sourceMappingURL=download.js.map