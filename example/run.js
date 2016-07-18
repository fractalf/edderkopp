#!/usr/bin/env node
'use strict';

var fs = require('fs');
var config = require('../dist').config;
var Parser = require('../dist').Parser;
var log = require('../dist').log;

var conf = config.get(__dirname + '/site.json');
var html = fs.readFileSync(__dirname + '/site.html').toString();
var parser = new Parser(html);
// parser.includeNull = false;
var data = parser.getData(conf.pages.somePage);
log.info(data);
