export default class Queue {

    constructor(options = {}) {
        this.maxItems = options.maxItems !== undefined ? options.maxItems : Number.MAX_VALUE;
        this.maxDepth = options.maxDepth !== undefined ? options.maxDepth : Number.MAX_VALUE;
        this.init();
    }

    init() {
        this._stack = { add: [], get: [] };
        this._depth = 0;
        this._items = 0;
    }

    get empty() {
        return this._stack.add.length == 0 && this._stack.get.length == 0;
    }

    get depth() {
        return this._depth;
    }

    add(items) {
        if (!Array.isArray(items)) {
            items = [ items ];
        }
        for (let i = 0; i < items.length; i++) {
            if (this._items < this.maxItems) {
                this._stack.add.push(items[i]);
                this._items++
            } else {
                // Reached max items, don't add more
                break;
            }
        };
    }

    get() {
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
}
