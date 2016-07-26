import md5 from 'blueimp-md5';

export default class {

    constructor() {
        this.init();
    }

    init() {
        this._items = {};
    }

    has(item) {
        return this._items[md5(item)];
    }

    set(item) {
        this._items[md5(item)] = true;
    }

}
