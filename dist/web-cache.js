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

// WebCache

var _class = function () {
    function _class(file) {
        (0, _classCallCheck3.default)(this, _class);

        this.file = file || process.env.NODE_CONFIG_DIR || process.cwd() + '/web-cache.json';
    }

    (0, _createClass3.default)(_class, [{
        key: 'get',
        value: function get(url) {
            this._init();
            return this.cache[url] !== undefined ? this.cache[url] : false;
        }
    }, {
        key: 'set',
        value: function set(url, value) {
            this._init();
            this.cache[url] = value;
            _fs2.default.writeFileSync(this.file, (0, _stringify2.default)(this.cache));
        }
    }, {
        key: '_init',
        value: function _init() {
            if (this.cache === undefined) {
                try {
                    var f = _fs2.default.readFileSync(this.file);
                    this.cache = JSON.parse(f.toString());
                } catch (err) {
                    this.cache = {};
                }
            }
        }
    }]);
    return _class;
}();

exports.default = _class;
//# sourceMappingURL=web-cache.js.map