import log from './log';
import config from './config';
import Tasks from './tasks';
import Download from './download';
import Parser from './parser';
import Crawler from './crawler';
import WebCache from './web-cache';

global.VERSION = '1.0.0-alpha';
global.USER_AGENT = 'Edderkopp/' + VERSION;

export { log, config, Tasks, Download, Parser, Crawler, WebCache };
