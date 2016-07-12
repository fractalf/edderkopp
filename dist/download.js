'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (url, options) {
    if (options) {
        if (options.cookies) {
            var j = _request2.default.jar();
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = options.cookies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var cookie = _step.value;

                    j.setCookie(cookie, url);
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

            options.jar = j;
            delete options.cookies;
        }
        if (options.timeout) {
            options.timeout *= 1000;
        }
    }

    var t0 = process.hrtime();
    options = Object.assign({
        url: url,
        headers: {
            'User-Agent': USER_AGENT
        },
        gzip: true,
        timeout: 60000
    }, options);
    return new Promise(function (fulfill, reject) {
        (0, _request2.default)(options, function (error, response, html) {
            if (error !== null) {
                reject(error);
            } else if (response.statusCode !== 200) {
                reject('Error! Response code: ' + response.statusCode);
            } else if (html) {
                var diff = process.hrtime(t0);
                fulfill({
                    html: html,
                    headers: response.headers,
                    time: (diff[0] + diff[1] * 1e-9).toFixed(2) + ' s',
                    size: (response.socket.bytesRead / 1024).toFixed(2) + ' KB',
                    gzip: response.headers['content-encoding'] == 'gzip' ? true : false
                });
            } else {
                reject('This should not happen');
            }
        });
    });
};

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }