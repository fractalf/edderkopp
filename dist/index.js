'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cache = exports.Crawler = exports.Parser = exports.Download = exports.Tasks = exports.config = exports.bus = undefined;

var _bus = require('./bus');

var _bus2 = _interopRequireDefault(_bus);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _tasks = require('./tasks');

var _tasks2 = _interopRequireDefault(_tasks);

var _download = require('./download');

var _download2 = _interopRequireDefault(_download);

var _parser = require('./parser');

var _parser2 = _interopRequireDefault(_parser);

var _crawler = require('./crawler');

var _crawler2 = _interopRequireDefault(_crawler);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

global.VERSION = '1.0.0-beta';
global.USER_AGENT = 'Edderkopp/' + VERSION;

exports.bus = _bus2.default;
exports.config = _config2.default;
exports.Tasks = _tasks2.default;
exports.Download = _download2.default;
exports.Parser = _parser2.default;
exports.Crawler = _crawler2.default;
exports.Cache = _cache2.default;
//# sourceMappingURL=index.js.map