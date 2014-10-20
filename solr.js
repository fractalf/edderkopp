var solr = require('solr-client')
var log = require('./log');

var Solr = function(host, port, index) {
    if (index === undefined) {
        log.warn('[Solr] No index provided');
        return;
    }
    host = host || '192.168.1.104';
    port = port || '8983';
    this.client = solr.createClient({
        host: host,
        port: port,
        core: index
    });
}

Solr.prototype = Object.create(require('events').EventEmitter.prototype);

Solr.prototype.add = function(doc) {
    var self = this;
    this.client.add(doc, function(error, response) {
        if (error) {
            log.error('[Solr] ' + error);
        } else {
            self.client.commit();
            log.verbose('[Solr] Document added');
            self.emit('added', response);
        }
    });
}

module.exports = Solr;