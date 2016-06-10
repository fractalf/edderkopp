// var log = require('./log');

import log from './log';

export default class {

    stack = {
        add: [],
        get: []
    }
    maxItems = Number.MAX_VALUE;
    maxDepth = Number.MAX_VALUE;
    depth = 0;
    items = 0;

    constructor(maxItems, maxDepth) {
        if (maxItems) { this.maxItems = maxItems; }
        if (maxDepth) { this.maxDepth = maxDepth; }
    }

    isEmpty() {
        return this.stack.add.length == 0 && this.stack.get.length == 0;
    }

    add(items) {
        if (!Array.isArray(items)) {
            items = [ items ];
        }
        for (let i = 0; i < items.length; i++) {
            if (this.items < this.maxItems) {
                this.stack.add.push(items[i]);
                this.items++
            } else {
                // Reached max items, don't add more
                break;
            }
        };
    }

    get() {
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
}
