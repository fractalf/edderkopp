import fs from 'fs';
import URI from 'urijs';

export default { setPath, get };

let _path = __dirname + '/../config';

function setPath(path) {
    _path = path;
}

function get(arg) {
    if (Number.isInteger(arg)) {
        return getById(arg);
    } else if (arg.indexOf('http') !== -1) {
        return getByUrl(arg);
    } else if (/^[^/]+\.json$/.test(arg)) {
        return parse(_path + '/' + arg);
    } else {
        return parse(arg);
    }
}

function getById(id) {
    let files = getFiles(_path);
    for (let i = 0; i < files.length; i++) {
        if (files[i].match(/-(\d+)/).pop() == id) {
            return parse(files[i]);
        }
    }
    return false;
}

function getByUrl(url) {
    let hostname = new URI(url).hostname();
    let files = getFiles(_path);
    for (let i = 0; i < files.length; i++) {
        let config = parse(files[i]);
        if (hostname == new URI(config.url).hostname()) {
            return config;
        }
    }
    return false;
}

// Recursivly find all files
function getFiles(path) {
    var files = [];
    fs.readdirSync(path).forEach( (file) => {
        if (fs.statSync(path + '/' + file).isDirectory()) {
            files = files.concat(getFiles(path + '/' + file));
        } else {
            files.push(path + '/' + file);
        }
    });
    return files;
}

function parse(file) {
    return JSON.parse(fs.readFileSync(file).toString());
}
