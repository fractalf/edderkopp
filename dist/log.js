'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_winston2.default.emitErrs = true;

var Log = function () {
    function Log() {
        _classCallCheck(this, Log);

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
    }

    _createClass(Log, [{
        key: 'silly',


        // Mapping methods to winston
        value: function silly(msg) {
            this.log.silly(msg);
        }
    }, {
        key: 'debug',
        value: function debug(msg) {
            this.log.debug(msg);
        }
    }, {
        key: 'verbose',
        value: function verbose(msg) {
            this.log.verbose(msg);
        }
    }, {
        key: 'info',
        value: function info(msg) {
            this.log.info(msg);
        }
    }, {
        key: 'warn',
        value: function warn(msg) {
            this.log.warn(msg);
        }
    }, {
        key: 'error',
        value: function error(msg) {
            this.log.error(msg);
        }
    }, {
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