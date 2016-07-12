"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Queue

var _class = function () {
    function _class(maxItems, maxDepth) {
        _classCallCheck(this, _class);

        this.stack = {
            add: [],
            get: []
        };
        this.maxItems = Number.MAX_VALUE;
        this.maxDepth = Number.MAX_VALUE;
        this.depth = 0;
        this.items = 0;

        if (maxItems) {
            this.maxItems = maxItems;
        }
        if (maxDepth) {
            this.maxDepth = maxDepth;
        }
    }

    _createClass(_class, [{
        key: "isEmpty",
        value: function isEmpty() {
            return this.stack.add.length == 0 && this.stack.get.length == 0;
        }
    }, {
        key: "add",
        value: function add(items) {
            if (!Array.isArray(items)) {
                items = [items];
            }
            for (var i = 0; i < items.length; i++) {
                if (this.items < this.maxItems) {
                    this.stack.add.push(items[i]);
                    this.items++;
                } else {
                    // Reached max items, don't add more
                    break;
                }
            };
        }
    }, {
        key: "get",
        value: function get() {
            if (this.stack.get.length) {
                return this.stack.get.pop();
            } else {
                if (this.stack.add.length) {
                    if (this.depth < this.maxDepth) {
                        this.stack.get = this.stack.add;
                        this.stack.add = [];
                        this.depth++;
                        return this.stack.get.pop();
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
    }]);

    return _class;
}();

exports.default = _class;
//# sourceMappingURL=queue.js.map