'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// WebCache

var _class = function () {
    function _class(file) {
        _classCallCheck(this, _class);

        this.file = file || process.env.NODE_CONFIG_DIR || process.cwd() + '/web-cache.json';
    }

    _createClass(_class, [{
        key: 'get',
        value: function get(url) {
            this._init();
            return this.cache[url] ? this.cache[url] : false;
        }
    }, {
        key: 'set',
        value: function set(url, html) {
            this._init();
            this.cache[url] = html;
            _fs2.default.writeFileSync(this.file, JSON.stringify(this.cache));
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