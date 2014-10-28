var elasticsearch = require('elasticsearch');
var CustomHttpConnector = require('./customHttpConnector');
var log = require('./log');
 
var Elasticsearch = function(host) {
    this.client = new elasticsearch.Client({
        host: host,
        //log: {
         //level: 'info'
        //},
        keepAlive: true,
        apiVerison: "1.3",
        connectionClass: CustomHttpConnector
    });
}

Elasticsearch.prototype = Object.create(require('events').EventEmitter.prototype);


Elasticsearch.prototype.info = function() {
    var options = {
        requestTimeout: 1000
    };
    this.client.info(options, function (error, response, status) {
        console.log(error);
        console.log(status);
        console.log(response);
    });
    
}
Elasticsearch.prototype.exists = function(index, type, id, cb) {
    var options = {
        index: index,
        type: type,
        id:  id
    };
    this.client.exists(options, function (error, response) {
        cb(response);
    });
}

Elasticsearch.prototype.create = function(doc, index, type, id) {
    var self = this;
    var options = {
        index: index,
        type: type,
        body:  doc
    };
    if (id !== undefined) {
        options.id = id;
    }
    this.client.create(options, function (error, response) {
        if (error) {
            log.error('[Elasticsearch] ' + error);
        } else {
            log.verbose('[Elasticsearch] Document id:' + id + ' added');
            //self.emit('added', response);
        }
    });
}

Elasticsearch.prototype.update = function(doc, index, type, id) {
    var self = this;
    var options = {
        index: index,
        type: type,
        body: {
            doc: doc,
            doc_as_upsert: true
        }
    };
    if (id !== undefined) {
        options.id = id;
    }
    this.client.update(options, function (error, response) {
        if (error) {
            log.error('[Elasticsearch] ' + error);
        } else {
            log.verbose('[Elasticsearch] Document id:' + id + ' added');
            //self.emit('added', response);
        }
    });
}

module.exports = Elasticsearch;
