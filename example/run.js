#!/usr/bin/env node
'use strict';
var fs = require('fs');
var config = require('../dist').config;
var Parser = require('../dist').Parser;
var log = require('../dist').log;

Parser.html = fs.readFileSync(__dirname + '/site.html').toString();
var conf = config.get(__dirname + '/site.json');
log.info(Parser.getData(conf.rules.foobar));
