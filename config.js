var fs = require('fs');
var log = require('./log');

var _config;

var Config = function() {}

Config.prototype.loadSite = function(site) {
    log.verbose('[Config] Load site: ' + site);
    
    if (!init()) { return false; }
    var file = _config.sites + '/' + site + '.json';
    if (fs.existsSync(file)) {
        if (!this.sites) {
            this.sites = {};
        }
        this.sites[site] = JSON.parse(fs.readFileSync(file).toString());
    } else {
        log.error('[Config] Missing ' + file);
        return false;
    }
    return true;
}

function init() {
    if (!_config) {
        var file = __dirname + '/config.json';
        if (fs.existsSync(file)) {
            _config = JSON.parse(fs.readFileSync(file).toString());
        } else {
            log.error('[Config] Missing ' + file);
            return false;
        }
    }
    return true;
}

module.exports = Config;
