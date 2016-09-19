import fs from 'fs';

export default class Cache {

    _cache;

    constructor(file) {
        if (file) {
            this._file = file;
        }
    }

    has(url) {
        this._init();
        return !!this._cache[url];
    }

    get(url) {
        this._init();
        return this._cache[url];
    }

    set(url, value) {
        this._init();
        this._cache[url] = value;
    }

    write() {
        if (this._file) {
            fs.writeFileSync(this._file, JSON.stringify(this._cache));
        }
    }

    keys() {
        this._init();
        return Object.keys(this._cache);
    }

    remove(url) {
        this._init();
        if (this._cache[url] !== undefined) {
            delete this._cache[url];
        }
    }

    _init() {
        if (this._cache === undefined) {
            if (this._file) {
                try {
                    const f = fs.readFileSync(this._file);
                    this._cache = JSON.parse(f.toString());
                } catch (err) {
                    this._cache = {};
                }
            } else {
                this._cache = {};
            }
        }
    }
}
