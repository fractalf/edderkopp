#!/usr/bin/env node

// NOTE!
// This example requires that you have installed devDependencies (or "babel-cli" and "babel-preset-es2015" to be spesific)
// Transpile or run directly with "npm run example" (se package.json)

import fs from 'fs';
import { log, config, Parser } from "../dist";

Parser.html = fs.readFileSync(__dirname + '/site.html').toString();
const conf = config.get(__dirname + '/site.json');
log.info(Parser.getData(conf.rules.foobar));
