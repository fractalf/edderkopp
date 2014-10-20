var log = require('./log');
var Config = require('./config');
var Queue = require('./queue');
var Download = require('./download');
var Parser = require('./parser');
var indexer = require('./indexer');

var Edderkopp = function() {
    var self = this;
    
    this.config = new Config();
    this.queue = new Queue();
    this.indexer = indexer;
    this.download = new Download();
    
    this.indexer.init('elasticsearch');
    
};


Edderkopp.prototype.getShop = function(shop) {
    log.verbose('[Edderkopp] Get shop: ' + shop);
    var self = this;
    
    // Load config
    if (!this.config.load(shop)) {
        return;
    }
    
    //var url = config.getUrl();
    //var url = 'http://www.clasohlson.com/no/Asaklitt-Focus-LED-lommelykt/Pr364840000';
    var url = 'http://jovial.no/loaded-vanguard-longboard-1';
    this.parser = new Parser({
        url: url,
        targets: this.config.getTargets(),
        blacklist: this.config.getBlacklist()
    });

    this.download.get(url);
    
    this.download.on('finished', function(response) {
        self.parser.load(response);
        if (self.parser.isTarget()) {
            var data = self.parser.getData();
            //console.log(data);
            self.indexer.add(data);
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
