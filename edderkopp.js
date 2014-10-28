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

    //this.solr = new Solr('host', 'port', 'index');
    
};

Edderkopp.prototype.initIndex = function(target) {
    if (!this.config.loadAuth(target)) {
        return;
    }
    
    if (target == 'elasticsearch') {
        this.elasticsearch = new Elasticsearch(this.config.elasticsearch);
    } else if (target == 'solr') {
        
    }
}

Edderkopp.prototype.checkIndex = function() {
    this.initIndex('elasticsearch');
    if (this.elasticsearch) {
        this.elasticsearch = new Elasticsearch(this.config.elasticsearch);
        this.elasticsearch.info();
    }
}

Edderkopp.prototype.initSite = function(site) {
    log.verbose('[Edderkopp] Init site: ' + site);
    var self = this;
    
    if (this.config.loadSite(site)) {
        this.parser.init({
            url: this.config.site.url,
            targets: this.config.site.targets,
            blacklist: this.config.site.blacklist || {}
        });
        return true;
    } else {
        return false;
    }
}

Edderkopp.prototype.getPage = function(site, url) {
    log.verbose('[Edderkopp] Get page: ' + url);
    
    if (!this.initSite(site)) {
        return;
    }
    //this.initIndex('elasticsearch');
    
    var self = this;
    this.download.get(url);
    this.download.on('finished', function(response) {
        self.parser.load(response);
        if (self.parser.isTarget()) {
            var data = self.parser.getData();
            data.url = response.url;
            if (self.elasticsearch) {
                var id = 'shop_id' + self.config.site.id + 'product_id' + data.shop_product_id;
                self.elasticsearch.create(data, 'shops', 'product', id);
            } else {
                console.log(data);
            }
        } else {
            log.verbose('[Edderkopp] Url is not listet as target for site');
        }
    });
}

Edderkopp.prototype.getSite = function(site) {
    log.verbose('[Edderkopp] Get site: ' + site);

    if (!this.initSite(site)) {
        return;
    }
    this.initIndex('elasticsearch');

    var self = this;
    this.download.get(this.config.site.url);
    this.download.on('finished', function(response) {
        self.parser.load(response);
        if (self.parser.isTarget()) {
            var data = self.parser.getData();
            data.url = response.url;
            if (self.elasticsearch) {
                var id = 'shop_id' + self.config.site.id + 'product_id' + data.shop_product_id;
                self.elasticsearch.exists('shopz', 'product', id, function(response) {
                    if (response) {
                        log.warn('[Edderkopp] Document exists: ' + id);
                    } else {
                        log.verbose('[Edderkopp] Adding document: ' + id);
                        self.elasticsearch.create(data, 'shopz', 'product', id);
                    }
                    
                });
            } else {
                console.log(data);
            }
        }
        
        if (self.queue.active) {
            var links = self.parser.getLinks();
            if (links) {
                self.queue.add(links);
            }
        }
        
        var url = self.queue.get();
        if (url) {
            // Delay
            if (self.config.site.delay) {
                setTimeout(function() {
                    self.download.get(url);
                }, self.config.site.delay)
            } else {
                self.download.get(url);
            }
        
        }
    });
}

module.exports = Edderkopp;
