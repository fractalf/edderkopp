import fs from 'fs';
import URI from 'urijs';

export default { setPath, get };

let _path = __dirname + '/../config';

function setPath(path) {
    _path = path;
}

function get(arg) {
    if (Number.isInteger(arg)) {
        return _getById(arg);
    } else if (arg.indexOf('http') !== -1) {
        return _getByUrl(arg);
    } else if (/^[^/]+\.json$/.test(arg)) {
        return _parse(_path + '/' + arg);
    } else {
        return _parse(arg);
    }
}

function _getById(id) {
    let files = _getFiles(_path);
    for (let i = 0; i < files.length; i++) {
        if (files[i].match(/-(\d+)/).pop() == id) {
            return _parse(files[i]);
        }
    }
    return false;
}

function _getByUrl(url) {
    let hostname = new URI(url).hostname();
    let files = _getFiles(_path);
    for (let i = 0; i < files.length; i++) {
        let config = _parse(files[i]);
        if (hostname == new URI(config.url).hostname()) {
            return config;
        }
    }
    return false;
}

// Recursivly find all files
function _getFiles(path) {
    var files = [];
    fs.readdirSync(path).forEach((file) => {
        if (fs.statSync(path + '/' + file).isDirectory()) {
            files = files.concat(_getFiles(path + '/' + file));
        } else {
            files.push(path + '/' + file);
        }
    });
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
