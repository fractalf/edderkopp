'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_winston2.default.emitErrs = true;

var Log = function () {
    function Log() {
        var _this = this;

        (0, _classCallCheck3.default)(this, Log);
        this._level = 'info';

        this.log = new _winston2.default.Logger({
            transports: [new _winston2.default.transports.Console({
                level: this._level,
                handleExceptions: false,
                json: false,
                prettyPrint: true,
                colorize: true
            })],
            exitOnError: false
        });
        this._settings = this.log.transports.console;

        // Mapping methods to winston and support util.format('a %s c', 'b')
        ['silly', 'debug', 'verbose', 'info', 'warn', 'error'].forEach(function (func) {
            _this[func] = function () {
                for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
                    arg[_key] = arguments[_key];
                }

                _this.log[func](arg[1] !== undefined ? _util2.default.format.apply(null, arg) : arg[0]);
            };
        });
    }

    (0, _createClass3.default)(Log, [{
        key: 'file',
        set: function set(filename) {
            this.log = new _winston2.default.Logger({
                transports: [new _winston2.default.transports.File({
                    level: this._level,
                    filename: filename,
                    zippedArchive: true,
                    tailable: true,
                    handleExceptions: false,
                    json: false,
                    maxsize: 5242880, // 5MB
                    maxFiles: 5
                })],
                exitOnError: false
            });
            this._settings = this.log.transports.file;
        }

        /**
         * Config levels:
         *   silly: 0,
         *   debug: 1,
         *   verbose: 2,
         *   info: 3,
         *   warn: 4,
         *   error: 5
         */

    }, {
        key: 'level',
        set: function set(level) {
            this._level = level;
            this._settings.level = level;
        }
    }]);
    return Log;
}();

var log = new Log();
exports.default = log;
//# sourceMappingURL=log.js.map