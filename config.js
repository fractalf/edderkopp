var fs = require('fs');
var log = require('./log');

var configDir = __dirname + '/config/';

var Config = function() {}

Config.prototype.load = function(type, target) {
    var file = configDir + type + '/' + site + '.json';
    if (fs.existsSync(file)) {
        if (this[type] === undefined) {
            this[type] = {};
        }
        this[type][target] = JSON.parse(fs.readFileSync(file).toString());
        return true;
    } else {
        log.error('[Config] File does not exist: ' + file);
        return false;
    }

}

module.exports = Config;
