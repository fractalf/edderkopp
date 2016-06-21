/**
 * Also can use:
 * https://github.com/lorenwest/node-config
 */

import fs from 'fs';
import URI from 'urijs';

export default { get, _getFiles };

let _dir = process.env.NODE_CONFIG_DIR || process.cwd() + '/config';
let _files; // cache

function get(arg, dir) {
    if (dir) {
        _dir = dir;
    }
    if (Number.isInteger(arg)) {
        return _getById(arg);
    } else if (arg.indexOf('http') !== -1) {
        return _getByUrl(arg);
    } else if (/^[^/]+\.json$/.test(arg)) {
        return _parse(_dir + '/' + arg);
    } else {
        return _parse(arg);
    }
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
    let hostname = URI(url).hostname();
    for (let file of _files) {
        let config = _parse(file);
        if (hostname == URI(config.url.entry).hostname()) {
            return config;
        }
    }
    return false;
}

function _parse(file) {
    var match = file.match(/.*\.([^.]*)$/);
    if (match[1] == 'json') {
        return JSON.parse(fs.readFileSync(file).toString());
    } else if (match[1] == 'js') {
        return require(file);
    }
}
