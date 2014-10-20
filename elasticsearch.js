var elasticsearch = require('elasticsearch');
var log = require('./log');

var Elasticsearch = function() {
    host = host || '192.168.1.104';
    port = port || '9200';
    this.client = new elasticsearch.Client({
        host: host + ':' + port,
        apiVerison: "1.3"
    });
}

Elasticsearch.prototype = Object.create(require('events').EventEmitter.prototype);

Elasticsearch.prototype.add = function(index, type, id, doc) {
    var self = this;
    this.client.create({
        index: index,
        type: type,
        id: id,
        body: doc
    }, function (error, response) {
        if (error) {
            log.error('[Elasticsearch] ' + error);
        } else {
            log.verbose('[Elasticsearch] Document added');
            self.emit('add', response);
        }
    });
}

module.exports = Elasticsearch;
