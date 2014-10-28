var fs = require('fs');
var log = require('./log');

var Config = function() {}

Config.prototype.loadSite = function(site) {
    
    var file = __dirname + '/config/' + site + '.json';
    if (fs.existsSync(file)) {
        this.site = JSON.parse(fs.readFileSync(file).toString());
        //for (var prop in this._config) {
            //this[prop] = this._config[prop];
        //}
        return true;
    } else {
        log.error('File does not exist: ' + file);
        return false;
    }
    
}

Config.prototype.loadAuth = function(target) {
    var file = __dirname + '/config/auth/' + target + '.json';
    if (fs.existsSync(file)) {
        this[target] = JSON.parse(fs.readFileSync(file).toString());
        return true;
    } else {
        log.error('File does not exist: ' + file);
        return false;
    }
    
}

module.exports = Config;
