import fs from 'fs';
import u from 'url';

class Config {

    constructor() {
        this._dir = process.env.NODE_CONFIG_DIR || process.cwd() + '/config';
    }

    // Set config dir
    set dir(dir) {
        this._dir = dir;
    }

    // Get config
    get(arg) {
        if (Number.isInteger(arg)) { // support id in filename (ex: configfile-<id>.js)
            return this._getById(arg);
        } else if (arg.indexOf('http') !== -1) { // support url (will look for the url property in all config files)
            return this._getByUrl(arg);
        } else if (arg.indexOf('/') !== -1) { // support full path of file (ex: /home/user/config.js)
            return this._parse(arg);
        } else { // support recursive search for config file in dir. return first found (ex: configfile.js)
            return this._getByFile(arg);
        }
    }

    // Get config by id. Match id with all files found in _getFiles
    _getById(id) {
        this._init();
        for (let file of this._files) {
            let match = file.match(/-(\d+)\./);
            if (match && match[1] == id) {
                return this._parse(file);
            }
        }
        return false;
    }

    // Get config by filename. Match file with all files found in _getFiles
    _getByFile(file) {
        this._init();
        for (let f of this._files) {
            if (f.indexOf(file) > -1) {
                return this._parse(f);
            }
        }
        return false;
    }

    // Get config by url. Open all files found in _getFiles and look at the url property
    _getByUrl(url) {
        this._init();
        let hostname = u.parse(url).hostname;
        for (let file of this._files) {
            let config = this._parse(file);
            if (config.url && config.url.entry && hostname == u.parse(config.url.entry).hostname) {
                return config;
            }
        }
        return false;
    }

    // Get filenames
    _init() {
        if (!this._files) {
            this._files = this._getFiles(this._dir);
        }
    }

    // Open and parse file
    _parse(file) {
        var match = file.match(/.*\.([^.]*)$/);
        if (match[1] == 'json') {
            return JSON.parse(fs.readFileSync(file).toString());
        } else if (match[1] == 'js') {
            return require(file);
        }
    }


    // Recursivly find all filenames
    _getFiles(dir) {
        let files = [];
        for (let file of fs.readdirSync(dir)) {
            if (fs.statSync(dir + '/' + file).isDirectory()) {
                files = files.concat(this._getFiles(dir + '/' + file));
            } else {
                files.push(dir + '/' + file);
            }
        };
        return files;
    }
}

const config = new Config();
export default config;
