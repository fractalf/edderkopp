import bus from './bus';
import config from './config';
import Tasks from './tasks';
import Download from './download';
import Parser from './parser';
import Crawler from './crawler';
import Cache from './cache';

global.VERSION = '1.0.0-beta';
global.USER_AGENT = 'Edderkopp/' + VERSION;

export { bus, config, Tasks, Download, Parser, Crawler, Cache };
