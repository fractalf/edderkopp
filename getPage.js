#!/usr/bin/env node
var log = require('./log');
var Edderkopp = require('./edderkopp');

log.transports.console.level = 'verbose';
//log.transports.console.level = 'debug';
log.transports.console.prettyPrint = true;

// Check argv
var url = process.argv[2];
if (url === undefined) {
    var thisFile = process.argv[1].split('/').pop();
    log.info('Usage: ' + thisFile + ' <url>');
    process.exit(1);
}

// Init Edderkopp
var edderkopp = new Edderkopp();

var config = edderkopp.config.getByUrl(url);


edderkopp.download.get(url).then(function(html) {
    
    // Load parser with html etc
    log.verbose('[getPage] Parse');
    var obj = {
        url: url,
        config: config,
        html: html
    }
    //edderkopp.parser.load(html, config, url);
    
    // Parse html and get data specified in config
    var data = edderkopp.parser.getData(obj);
    log.info(data);
}).catch(function (error) {
    log.error(error);
});

