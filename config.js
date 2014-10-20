var fs = require('fs');
var log = require('./log');


var Config = function() {}

Config.prototype.load = function(shop) {
    var file = __dirname + '/config/' + shop + '.json';
    if (fs.existsSync(file)) {
        this._config = JSON.parse(fs.readFileSync(file).toString());
        return true;
    } else {
        log.error('File does not exist: ' + file);
        return false;
    }
    
}

Config.prototype.getUrl = function() {
    return this._config.url;
}

Config.prototype.getTargets = function() {
    return this._config.targets;
}

Config.prototype.getBlacklist = function() {
    return this._config.blacklist || {};
}

module.exports = Config;

//var config = exports;
//
//var _config;
//
//config.load = function(shop) {
//    var file = __dirname + '/config/' + shop + '.json';
//    if (fs.existsSync(file)) {
//        _config = JSON.parse(fs.readFileSync(file).toString());
//        return true;
//    } else {
//        log.error('File does not exist: ' + file);
//        return false;
//    }
//    
//}
//
//config.getUrl = function() {
//    return _config.url;
//}
//
//config.getTargets = function() {
//    return _config.targets;
//}
//
//config.getBlacklist = function() {
//    return _config.blacklist || {};
//}
//
//
//var ConfigLoader = {
//    config: null,
//    load: function(file){
//        //return this.config = JSON.parse(fs.readFileSync(file).toString());
//        return JSON.parse(fs.readFileSync(file).toString());
//    },
//    show: function(file){
//        console.log(fs.readFileSync(file).toString());
//    },
//    getByKey: function(key) {
//        return this.config[key] !== undefined ? this.config[key] : false;
//    },
//    getById: function(id) {
//        for (var key in this.config) {
//            if (this.config[key].id === id) {
//                return this.config[key];
//            }
//        }
//        return false;
//    },
//    getByUrl: function(url) {
//        for (var key in this.config) {
//            if (url.indexOf(this.config[key].url) !== -1) {
//                return this.config[key];
//            }
//        }
//        return false;
//    },
//    getAllKeys: function() {
//        return Object.keys(this.config);
//    }
//};
//module.exports = ConfigLoader;