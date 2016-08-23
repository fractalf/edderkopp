'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WebCache = function () {
    function WebCache(file) {
        (0, _classCallCheck3.default)(this, WebCache);

        this._file = file || process.env.NODE_CONFIG_DIR || process.cwd() + '/web-cache.json';
    }

    (0, _createClass3.default)(WebCache, [{
        key: 'has',
        value: function has(url) {
            this._init();
            return !!this._cache[url];
        }
    }, {
        key: 'get',
        value: function get(url) {
            this._init();
            return this._cache[url] !== undefined ? this._cache[url] : false;
        }
    }, {
        key: 'set',
        value: function set(url, value) {
            this._init();
            this._cache[url] = value;
            _fs2.default.writeFileSync(this._file, (0, _stringify2.default)(this._cache));
        }
    }, {
        key: 'remove',
        value: function remove(url) {
            this._init();
            if (this._cache[url] !== undefined) {
                delete this._cache[url];
                _fs2.default.writeFileSync(this._file, (0, _stringify2.default)(this._cache));
            }
        }
    }, {
        key: '_init',
        value: function _init() {
            if (this._cache === undefined) {
                try {
                    var f = _fs2.default.readFileSync(this._file);
                    this._cache = JSON.parse(f.toString());
                } catch (err) {
                    this._cache = {};
                }
            }
        }
    }, {
        key: 'file',
        set: function set(file) {
            this._file = file;
        }
    }]);
    return WebCache;
}();

exports.default = WebCache;
//# sourceMappingURL=web-cache.js.map