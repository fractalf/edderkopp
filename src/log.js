import winston from 'winston';

winston.emitErrs = true;

class Log {
    constructor() {
        this.console = new winston.Logger({
            transports: [
                new winston.transports.Console({
                    level: 'info',
                    handleExceptions: false,
                    json: false,
                    prettyPrint: true,
                    colorize: true
                })
            ],
            exitOnError: false
        });
        this.file = new winston.Logger({
            transports: [
                new winston.transports.File({
                    level: 'info',
                    filename: 'error.log',
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
        this.log = this.console;
    }

    set target(target) {
        if (target == 'console') {
            this.log = this.console;
        } else if (target == 'file') {
            this.log = this.file;
        }
    }

    set silent(value) {
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
    set level(level) {
        this.console.transports.console.level = level;
        this.file.transports.file.level = level;
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
