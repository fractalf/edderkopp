#!/usr/bin/env node
var log = require('./log');
var Edderkopp = require('./edderkopp');

log.transports.console.level = 'verbose';

// Check argv
var site = process.argv[2];
var url = process.argv[3];
if (url === undefined) {
    var thisFile = process.argv[1].split('/').pop();
    log.info('Usage: ' + thisFile + ' <site> <url>');
    process.exit(1);
}

var edderkopp = new Edderkopp();
edderkopp.getPage(site, url);
