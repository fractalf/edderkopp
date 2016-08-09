import fs from 'fs';

// WebCache
export default class {

    constructor(file) {
        this._file = file || process.env.NODE_CONFIG_DIR || process.cwd() + '/web-cache.json';
    }

    set file(file) {
        this._file = file;
    }

    has(url) {
        this._init();
        return !!this._cache[url];
    }

    get(url) {
        this._init();
        return this._cache[url] !== undefined ? this._cache[url] : false;
    }

    set(url, value) {
        this._init();
        this._cache[url] = value;
        fs.writeFileSync(this._file, JSON.stringify(this._cache));
    }

    remove(url) {
        this._init();
        if (this._cache[url] !== undefined) {
            delete this._cache[url];
            fs.writeFileSync(this._file, JSON.stringify(this._cache));
        }
    }

    _init() {
        if (this._cache === undefined) {
            try {
                const f = fs.readFileSync(this._file);
                this._cache = JSON.parse(f.toString());
            } catch (err) {
                this._cache = {};
            }
        }
    }
}
