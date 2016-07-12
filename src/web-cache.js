import fs from 'fs';

// WebCache
export default class {

    constructor(file) {
        this.file = file || process.env.NODE_CONFIG_DIR || process.cwd() + '/web-cache.json';
    }

    get(url) {
        this._init();
        return this.cache[url] ? this.cache[url] : false;
    }

    set(url, html) {
        this._init();
        this.cache[url] = html;
        fs.writeFileSync(this.file, JSON.stringify(this.cache));
    }

    _init() {
        if (this.cache === undefined) {
            try {
                const f = fs.readFileSync(this.file);
                this.cache = JSON.parse(f.toString());
            } catch (err) {
                this.cache = {};
            }
        }

    }

}
