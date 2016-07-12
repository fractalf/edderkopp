#!/usr/bin/env node

// NOTE! Run this with "npm run example" (se package.json) or transpile it with babel
import fs from 'fs';
import { log, config, Parser } from "../dist";

const conf = config.get(__dirname + '/site.json');
const html = fs.readFileSync(__dirname + '/site.html').toString();
const parser = new Parser(html);
const data = parser.getData(conf.pages.somePage);
log.info(data);
