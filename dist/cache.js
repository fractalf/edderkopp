'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Cache = function () {
    function Cache(file) {
        (0, _classCallCheck3.default)(this, Cache);

        if (file) {
            this._file = file;
        }
    }

    (0, _createClass3.default)(Cache, [{
        key: 'has',
        value: function has(url) {
            this._init();
            return !!this._cache[url];
        }
    }, {
        key: 'get',
        value: function get(url) {
            this._init();
            return this._cache[url];
        }
    }, {
        key: 'set',
        value: function set(url, value) {
            this._init();
            this._cache[url] = value;
        }
    }, {
        key: 'write',
        value: function write() {
            if (this._file) {
                _fs2.default.writeFileSync(this._file, (0, _stringify2.default)(this._cache));
            }
        }
    }, {
        key: 'keys',
        value: function keys() {
            this._init();
            return (0, _keys2.default)(this._cache);
        }
    }, {
        key: '_init',
        value: function _init() {
            if (this._cache === undefined) {
                if (this._file) {
                    try {
                        var f = _fs2.default.readFileSync(this._file);
                        this._cache = JSON.parse(f.toString());
                    } catch (err) {
                        this._cache = {};
                    }
                } else {
                    this._cache = {};
                }
            }
        }
    }]);
    return Cache;
}();

exports.default = Cache;
//# sourceMappingURL=cache.js.map