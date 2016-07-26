'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _blueimpMd = require('blueimp-md5');

var _blueimpMd2 = _interopRequireDefault(_blueimpMd);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function () {
    function _class() {
        (0, _classCallCheck3.default)(this, _class);

        this.init();
    }

    (0, _createClass3.default)(_class, [{
        key: 'init',
        value: function init() {
            this._items = {};
        }
    }, {
        key: 'has',
        value: function has(item) {
            return this._items[(0, _blueimpMd2.default)(item)];
        }
    }, {
        key: 'set',
        value: function set(item) {
            this._items[(0, _blueimpMd2.default)(item)] = true;
        }
    }]);
    return _class;
}();

exports.default = _class;
//# sourceMappingURL=cache.js.map