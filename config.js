var fs = require('fs');
var URI = require('URIjs');
var log = require('./log');

//var _config;
var _config = '/nfs/home/alf/edderkopp/config';

var Config = function() {
    //this.shops = {};
    //this.sites = {};
}

// Load all shops
Config.prototype.getShops = function() {
    log.verbose('[Config] Get config for all shops');
    var files = getFiles(_config + '/sites/shops');
    var config = {};
    for (var i = 0; i < files.length; i++) {
        var obj = JSON.parse(fs.readFileSync(files[i]).toString());
        config[obj.key] = obj;
        config[obj.id] = obj;
        
    }
    return config;
}

Config.prototype.getByUrl = function(url) {
    var hostname = new URI(url).hostname();
    var files = getFiles(_config + '/sites');
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

//function init() {
//    if (!_config) {
//        var file = __dirname + '/config.json';
//        if (fs.existsSync(file)) {
//            _config = JSON.parse(fs.readFileSync(file).toString());
//        } else {
//            log.error('[Config] Missing ' + file);
//        }
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
