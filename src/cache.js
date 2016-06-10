import md5 from 'blueimp-md5';

export default class {

    items = {};

    has(item) {
        return this.items[md5(item)];
    }

    set(item) {
        this.items[md5(item)] = true;
    }

}
