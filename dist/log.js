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

        this.console = new _winston2.default.Logger({
            transports: [new _winston2.default.transports.Console({
                level: 'info',
                handleExceptions: false,
                json: false,
                prettyPrint: true,
                colorize: true
            })],
            exitOnError: false
        });
        this.file = new _winston2.default.Logger({
            transports: [new _winston2.default.transports.File({
                level: 'info',
                filename: 'error.log',
                zippedArchive: true,
                tailable: true,
                handleExceptions: false,
                json: false,
                maxsize: 5242880, // 5MB
                maxFiles: 5
            })],
            exitOnError: false
        });
        this.log = this.console;
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
        key: 'target',
        set: function set(target) {
            if (target == 'console') {
                this.log = this.console;
            } else if (target == 'file') {
                this.log = this.file;
            }
        }
    }, {
        key: 'silent',
        set: function set(value) {
            this.console.transports.console.silent = value;
            this.file.transports.file.silent = value;
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
            this.console.transports.console.level = level;
            this.file.transports.file.level = level;
        }
    }]);

    return Log;
}();

var log = new Log();
exports.default = log;