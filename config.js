var fs = require('fs');
var URI = require('URIjs');
var log = require('./log');

var _config;
var _shops;

// Read config.json
var file = __dirname + '/config.json';
if (fs.existsSync(file)) {
    _config = JSON.parse(fs.readFileSync(file));
} else {
    log.error('[Config] Missing ' + file);
}

var Config = function() {}

// Load all shops
Config.prototype.getShops = function() {
    if (!_shops) {
        log.verbose('[Config] Get config for all shops');
        var files = getFiles(_config.shops + '/sites/shops');
        var _shops = {};
        for (var i = 0; i < files.length; i++) {
            var obj = JSON.parse(fs.readFileSync(files[i]).toString());
            _shops[obj.key] = obj;
            _shops[obj.id] = obj;
            
        }
    }
    return _shops;
}

Config.prototype.getByUrl = function(url) {
    var hostname = new URI(url).hostname();
    var files = getFiles(_config.shops + '/sites');
    for (var i = 0; i < files.length; i++) {
        var obj = JSON.parse(fs.readFileSync(files[i]).toString());
        if (hostname == new URI(obj.url).hostname()) {
            log.verbose('[Config] Get config for ' + obj.name);
            return obj;
        }
    }
    log.error('[Config] Missing config for ' + url);
    return false;
}

//Config.prototype.load = function(target, key) {
//    log.verbose('[Config] Load ' + target + ': ' + key);
//    init();
//    
//    var file = _config[target] + '/' + key + '.json';
//    if (fs.existsSync(file)) {
//        return this[target][key] = JSON.parse(fs.readFileSync(file).toString());
//    } else {
//        log.error('[Config] Missing ' + file);
//        return false;
//    }
//}


function getContent(file) {
    var obj = JSON.parse(fs.readFileSync(path + '/' + file).toString());
    self[target][obj.key] = obj;
    self[target][obj.id] = obj;
}

function getFiles(path) {
    var files = [];
    fs.readdirSync(path).forEach(function(file) {
        if (fs.statSync(path + '/' + file).isDirectory()) {
            files = files.concat(getFiles(path + '/' + file));
        } else {
            files.push(path + '/' + file);
        }
        //log.verbose(file);
        //var obj = JSON.parse(fs.readFileSync(path + '/' + file).toString());
        //self[target][obj.key] = obj;
        //self[target][obj.id] = obj;
    });
    return files;
}
module.exports = Config;
