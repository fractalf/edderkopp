var request = require('request');
var log = require('./log');
var Promise = require('es6-promise').Promise;

var Download = function() {}

Download.prototype = Object.create(require('events').EventEmitter.prototype);

Download.prototype.get = function(url, obj) {
    //var self = this;
    var t = process.hrtime();
    var options = {
        url: url,
        headers: {
            'User-Agent': 'request'
        },
        timeout: 30000
    }
    return new Promise(function (fulfill, reject) {
        request(options, function (error, response, html) {
            if (error !== null) {
                if (error.code === 'ETIMEDOUT') {
                    log.warn('[Download] Timeout of ' + options.timeout * 0.001 + 's reached for ' + url);
                    obj ? fulfill(obj) : fulfill();
                } else {
                    log.error('[Download] ' + error.toString() + ' (' + url + ')');
                    reject(error);
                }
            } else if (response.statusCode !== 200) {
                //log.error('[Download] Status code ' + response.statusCode + ' (' + url + ')');
                //log.error('[Download] Response: ' + JSON.stringify(response));
                reject(response);
            } else if (html){
                t = process.hrtime(t);
                var diff = (t[0] + t[1] * 1e-9).toFixed(2);
                log.verbose('[Download] ' + url + ' (' + diff + 's)');
                if (obj) {
                    obj.html = html;
                    fulfill(obj);
                } else {
                    fulfill(html);
                }
            } else {
                log.error('[Download] WEIRD!! No errors AND no html');
                reject();
            }
        });
    });
    
}

module.exports = Download;
