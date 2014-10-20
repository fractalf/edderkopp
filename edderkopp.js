var log = require('./log');
var Config = require('./config');
var Queue = require('./queue');
var Download = require('./download');
var Parser = require('./parser');
var Elasticsearch = require('./elasticsearch');
var Solr = require('./solr');

var Edderkopp = function() {
    var self = this;
    
    this.config = new Config();
    this.queue = new Queue();
    this.download = new Download();
    this.parser = new Parser();
    //this.elasticsearch = new Elasticsearch('host', 'port',);
    //this.solr = new Solr('host', 'port', 'index');
    
};


Edderkopp.prototype.initSite = function(site) {
    log.verbose('[Edderkopp] Init site: ' + site);
    var self = this;
    
    // Load config
    if (!this.config.load(site)) {
        return;
    }
    
    var url = this.config.getUrl();
    this.parser.init({
        url: url,
        targets: this.config.getTargets(),
        blacklist: this.config.getBlacklist()
    });

}

Edderkopp.prototype.getPage = function(site, url) {
    log.verbose('[Edderkopp] Get page: ' + url);
    var self = this;
    this.initSite(site);
    this.download.get(url);
    this.download.on('finished', function(response) {
        self.parser.load(response);
        if (self.parser.isTarget()) {
            var data = self.parser.getData();
            console.log(data);
        } else {
            log.warning('[Edderkopp] Url is not listet as target for site');
        }
    });

}

Edderkopp.prototype.getSite = function(site) {
    log.verbose('[Edderkopp] Get site: ' + site);
    var self = this;
    this.initSite(site);
    var url = this.config.getUrl();
    this.download.get(url);
    this.download.on('finished', function(response) {
        self.parser.load(response);
        if (self.parser.isTarget()) {
            var data = self.parser.getData();
            console.log(data);
            //self.indexer.add(data);
        }
        
        if (self.queue.active) {
            var links = self.parser.getLinks();
            if (links) {
                self.queue.add(links);
            }
        }
        
        // INSERT DELAY HERE
        
        var url = self.queue.get();
        if (url) {
            self.download.get(url);
        }
    });
}

module.exports = Edderkopp;
