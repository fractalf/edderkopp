import config from './config';
import download from "./download"
import Parser from "./parser"
import log from "./log"

global.VERSION = '1.0.0-alpha';
global.USER_AGENT = 'Edderkopp/' + VERSION;

export { config, download, Parser, log };
