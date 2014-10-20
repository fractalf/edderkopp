var request = require('request');
var log = require('./log');

var Download = function() {}

Download.prototype = Object.create(require('events').EventEmitter.prototype);

Download.prototype.get = function(url) {
    var self = this;
    log.verbose('[Download] Get: ' + url);
    var t0 = process.hrtime();
    var options = {
        url: url,
        headers: {
            'User-Agent': 'request'
        }
    }
    request(options, function (error, response, html) {
        if (error !== null) {
            log.error('[Download] ' + error.toString() + ' (' + url + ')');
        } else if (response.statusCode !== 200) {
            log.error('[Download] Status code ' + response.statusCode + ' (' + url + ')');
            log.error('[Download] Response: ' + JSON.stringify(response));
        } else if (html){
            var t1 = process.hrtime(t0);
            var diff = (t1[0] + t1[1] * 1e-9).toFixed(2);
            log.verbose('[Download] Finished in ' + diff + 's');
            self.emit('finished', { html: html, url: url });
        } else {
            log.error('[Download] WEIRD!! No errors AND no html');
        }
    });
    
}

module.exports = Download;
