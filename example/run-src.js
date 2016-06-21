#!/usr/bin/env node
import fs from 'fs';
import { logger, config, Parser } from "../dist";

const log = logger.logConsole;
log.activate('debug');

const conf = config.get(__dirname + '/site.json');
const html = fs.readFileSync(__dirname + '/site.html').toString();
const parser = new Parser(html);
const data = parser.getData(conf.pages.somePage);
log.info(data);
