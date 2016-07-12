'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebCache = exports.Crawler = exports.Parser = exports.download = exports.config = exports.log = undefined;

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _download = require('./download');

var _download2 = _interopRequireDefault(_download);

var _parser = require('./parser');

var _parser2 = _interopRequireDefault(_parser);

var _crawler = require('./crawler');

var _crawler2 = _interopRequireDefault(_crawler);

var _webCache = require('./web-cache');

var _webCache2 = _interopRequireDefault(_webCache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

global.VERSION = '1.0.0-alpha';
global.USER_AGENT = 'Edderkopp/' + VERSION;

exports.log = _log2.default;
exports.config = _config2.default;
exports.download = _download2.default;
exports.Parser = _parser2.default;
exports.Crawler = _crawler2.default;
exports.WebCache = _webCache2.default;
//# sourceMappingURL=index.js.map