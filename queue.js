var log = require('./log');

var Queue = function(options) {
    this._stack = {
        get: [], // items at current level
        add: [] // items for next level
    }
    this.active = true;
    
    // Handle options and defaults
    options = options || {};
    this._maxLevel = options.maxLevel || 0;
    this._maxItems = options.maxItems || 10
    
    // Internal
    this._currentLevel = 0;
    this._currentItem = 0;
}

Queue.prototype.add = function(items) {
    log.verbose('[Queue] Received ' + items.length + ' items');
    if (this._currentLevel < this._maxLevel) {
        
        // Support items not in array
        if (!Array.isArray(items)) {
            items = [ items ];
        }
        
        // Add items to the stack
        var n = items.length;
        var added = 0;
        for (var i = 0; i < n; i++) {
            if (this._currentItem < this._maxItems) {
                this._stack.add.push(items[i]);
                this._currentItem++;
                added++;
                log.debug('[Queue] Added item: ' + items[i]);
            } else {
                this.active = false;
                log.debug('[Queue] Reached max items limit of ' + this._maxItems);
                break;
            }
        }
        log.verbose('[Queue] Added ' + added + ' items');
    } else {
        log.verbose('[Queue] No items added');
    }
}

Queue.prototype.get = function() {
    log.verbose('[Queue] Get item');
    if (this._stack.get.length) {
        return this._stack.get.pop();
    } else {
        if (this._currentLevel < this._maxLevel) {
            // Set next level
            this._currentLevel++;
            log.verbose('[Queue] Starting level ' + this._currentLevel);
            
            // Switch stack
            this._stack.get = this._stack.add;
            this._stack.add = [];
            
            if (this._stack.get.length) {
                return this._stack.get.pop();
            } else {
                this.active = false;
                log.verbose('[Queue] No more items in queue');
                return false;
            }
        } else {
            this.active = false;
            log.verbose('[Queue] Reached max level limit of ' + this._maxLevel);
            return false;
        }
    }
}

module.exports = Queue;
