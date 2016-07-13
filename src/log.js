import winston from 'winston';

winston.emitErrs = true;

class Log {

    _level = 'info';

    constructor() {
        this.log = new winston.Logger({
            transports: [
                new winston.transports.Console({
                    level: this._level,
                    handleExceptions: false,
                    json: false,
                    prettyPrint: true,
                    colorize: true
                })
            ],
            exitOnError: false
        });
        this._settings = this.log.transports.console;
    }

    set file(filename) {
        this.log = new winston.Logger({
            transports: [
                new winston.transports.File({
                    level: this._level,
                    filename,
                    zippedArchive: true,
                    tailable : true,
                    handleExceptions: false,
                    json: false,
                    maxsize: 5242880, // 5MB
                    maxFiles: 5
                })
            ],
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
    set level(level) {
        this._level = level;
        this._settings.level = level;
    }

    // Mapping methods to winston
    silly(msg) { this.log.silly(msg); }
    debug(msg) { this.log.debug(msg); }
    verbose(msg) { this.log.verbose(msg); }
    info(msg) { this.log.info(msg); }
    warn(msg) { this.log.warn(msg); }
    error(msg) { this.log.error(msg); }
}

const log = new Log();
export default log;
