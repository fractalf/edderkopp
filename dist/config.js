'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _urijs = require('urijs');

var _urijs2 = _interopRequireDefault(_urijs);

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
    if (Number.isInteger(arg)) {
        return _getById(arg);
    } else if (arg.indexOf('http') !== -1) {
        return _getByUrl(arg);
    } else if (/^[^/]+\.json$/.test(arg)) {
        return _parse(_dir + '/' + arg);
    } else {
        return _parse(arg);
    }
}

// Recursivly find all files
function _getFiles(dir) {
    var files = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = _fs2.default.readdirSync(dir)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var file = _step.value;

            if (_fs2.default.statSync(dir + '/' + file).isDirectory()) {
                files = files.concat(_getFiles(dir + '/' + file));
            } else {
                files.push(dir + '/' + file);
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

    ;
    return files;
}

function _getById(id) {
    _files = _files || _getFiles(_dir);
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = _files[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var file = _step2.value;

            var match = file.match(/-(\d+)\./);
            if (match && match[1] == id) {
                return _parse(file);
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

function _getByUrl(url) {
    _files = _files || _getFiles(_dir);
    var hostname = (0, _urijs2.default)(url).hostname();
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = _files[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var file = _step3.value;

            var config = _parse(file);
            if (hostname == (0, _urijs2.default)(config.url.entry).hostname()) {
                return config;
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

function _parse(file) {
    var match = file.match(/.*\.([^.]*)$/);
    if (match[1] == 'json') {
        return JSON.parse(_fs2.default.readFileSync(file).toString());
    } else if (match[1] == 'js') {
        return require(file);
    }
}