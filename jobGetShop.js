#!/usr/bin/env node
var log = require('./log');
var Edderkopp = require('./edderkopp');

log.transports.console.level = 'verbose';
//log.transports.console.level = 'debug';
//log.transports.console.level = 'silly';

// Check argv
var shop = process.argv[2];
if (shop === undefined) {
    var thisFile = process.argv[1].split('/').pop();
    log.info('Usage: ' + thisFile + ' -s <shop>');
    process.exit(1);
}

var job = new Edderkopp();
job.getShop(shop);
