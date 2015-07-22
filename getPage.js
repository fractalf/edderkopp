#!/usr/bin/env node
var log = require('./log');
var Edderkopp = require('./edderkopp');

log.transports.console.level = 'verbose';
log.transports.console.prettyPrint = true;

// Check argv
var site = process.argv[2];
var url = process.argv[3];
if (url === undefined) {
    var thisFile = process.argv[1].split('/').pop();
    log.info('Usage: ' + thisFile + ' <site> <url>');
    process.exit(1);
}

// Init Edderkopp
var edderkopp = new Edderkopp();

// Event listener
edderkopp.download.on('finished', function(response) {
    
    // Load cheerio with html
    edderkopp.parser.load(response);
    
    // Parse html and get data according to config
    var data = edderkopp.parser.getData();
    data.url = response.url;
    log.info(data);
    //console.log(JSON.stringify(data));
});

// INIT
if (edderkopp.initSite(site)) {
    edderkopp.download.get(url);
}
