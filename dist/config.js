'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _isInteger = require('babel-runtime/core-js/number/is-integer');

var _isInteger2 = _interopRequireDefault(_isInteger);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Also can use:
 * https://github.com/lorenwest/node-config
 */

exports.default = { get: get, dir: dir };


var _dir = process.env.NODE_CONFIG_DIR || process.cwd() + '/config';
var _files = void 0; // cache

function dir(dir) {
    _dir = dir;
}

function get(arg) {
    if ((0, _isInteger2.default)(arg)) {
        // support id in filename (ex: configfile-<id>.js)
        return _getById(arg);
    } else if (arg.indexOf('http') !== -1) {
        // support url (will look for the url property in all config files)
        return _getByUrl(arg);
    } else if (arg.indexOf('/') !== -1) {
        // support full path of file (ex: /home/user/config.js)
        return _parse(arg);
    } else {
        // support recursive search for config file in dir. return first found (ex: configfile.js)
        return _getByFile(arg);
    }
}

function _getById(id) {
    _files = _files || _getFiles(_dir);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = (0, _getIterator3.default)(_files), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var file = _step.value;

            var match = file.match(/-(\d+)\./);
            if (match && match[1] == id) {
                return _parse(file);
            }
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

    return false;
}

function _getByUrl(url) {
    _files = _files || _getFiles(_dir);
    var hostname = _url2.default.parse(url).hostname;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = (0, _getIterator3.default)(_files), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var file = _step2.value;

            var config = _parse(file);
            if (config.url && config.url.entry && hostname == _url2.default.parse(config.url.entry).hostname) {
                return config;
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

    return false;
}

function _getByFile(f) {
    _files = _files || _getFiles(_dir);
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = (0, _getIterator3.default)(_files), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var file = _step3.value;

            if (file.indexOf(f) > -1) {
                return _parse(file);
            }
        }
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    return false;
}

// Recursivly find all files
function _getFiles(dir) {
    var files = [];
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = (0, _getIterator3.default)(_fs2.default.readdirSync(dir)), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var file = _step4.value;

            if (_fs2.default.statSync(dir + '/' + file).isDirectory()) {
                files = files.concat(_getFiles(dir + '/' + file));
            } else {
                files.push(dir + '/' + file);
            }
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }

    ;
    return files;
}

function _parse(file) {
    var match = file.match(/.*\.([^.]*)$/);
    if (match[1] == 'json') {
        return JSON.parse(_fs2.default.readFileSync(file).toString());
    } else if (match[1] == 'js') {
        return require(file);
    }
}
//# sourceMappingURL=config.js.map