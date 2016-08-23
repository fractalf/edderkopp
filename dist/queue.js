"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Queue = function () {
    function Queue() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        (0, _classCallCheck3.default)(this, Queue);

        this.maxItems = options.maxItems !== undefined ? options.maxItems : Number.MAX_VALUE;
        this.maxDepth = options.maxDepth !== undefined ? options.maxDepth : Number.MAX_VALUE;
        this.init();
    }

    (0, _createClass3.default)(Queue, [{
        key: "init",
        value: function init() {
            this._stack = { add: [], get: [] };
            this._depth = 0;
            this._items = 0;
        }
    }, {
        key: "add",
        value: function add(items) {
            if (!Array.isArray(items)) {
                items = [items];
            }
            for (var i = 0; i < items.length; i++) {
                if (this._items < this.maxItems) {
                    this._stack.add.push(items[i]);
                    this._items++;
                } else {
                    // Reached max items, don't add more
                    break;
                }
            };
        }
    }, {
        key: "get",
        value: function get() {
            if (this._stack.get.length) {
                return this._stack.get.pop();
            } else {
                if (this._stack.add.length) {
                    if (this._depth < this.maxDepth) {
                        this._stack.get = this._stack.add;
                        this._stack.add = [];
                        this._depth++;
                        return this._stack.get.pop();
                    } else {
                        // Reached max depth
                        // console.log('Max depth!');
                        return false;
                    }
                } else {
                    // Out of items
                    // console.log('Out of items!');
                    return false;
                }
            }
        }
    }, {
        key: "empty",
        get: function get() {
            return this._stack.add.length == 0 && this._stack.get.length == 0;
        }
    }, {
        key: "depth",
        get: function get() {
            return this._depth;
        }
    }]);
    return Queue;
}();

exports.default = Queue;
//# sourceMappingURL=queue.js.map