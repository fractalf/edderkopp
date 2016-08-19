/**
 * Also can use:
 * https://github.com/lorenwest/node-config
 */

import fs from 'fs';
import u from 'url';

export default { get, dir };

let _dir = process.env.NODE_CONFIG_DIR || process.cwd() + '/config';
let _files; // cache

function dir(dir) {
    _dir = dir;
}

function get(arg) {
    if (Number.isInteger(arg)) {
        return _getById(arg);
    } else if (arg.indexOf('http') !== -1) {
        return _getByUrl(arg);
    } else {
        return _getByFile(arg);
    }
}

function _getById(id) {
    _files = _files || _getFiles(_dir);
    for (let file of _files) {
        let match = file.match(/-(\d+)\./);
        if (match && match[1] == id) {
            return _parse(file);
        }
    }
    return false;
}

function _getByUrl(url) {
    _files = _files || _getFiles(_dir);
    let hostname = u.parse(url).hostname;
    for (let file of _files) {
        let config = _parse(file);
        if (config.url && config.url.entry && hostname == u.parse(config.url.entry).hostname) {
            return config;
        }
    }
    return false;
}

function _getByFile(f) {
    _files = _files || _getFiles(_dir);
    for (let file of _files) {
        if (file.indexOf(f) > -1) {
            return _parse(file);
        }
    }
    return false;
}

// Recursivly find all files
function _getFiles(dir) {
    var files = [];
    for (let file of fs.readdirSync(dir)) {
        if (fs.statSync(dir + '/' + file).isDirectory()) {
            files = files.concat(_getFiles(dir + '/' + file));
        } else {
            files.push(dir + '/' + file);
        }
    };
    return files;
}

function _parse(file) {
    var match = file.match(/.*\.([^.]*)$/);
    if (match[1] == 'json') {
        return JSON.parse(fs.readFileSync(file).toString());
    } else if (match[1] == 'js') {
        return require(file);
    }
}
