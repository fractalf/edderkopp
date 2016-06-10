import winston from 'winston';
/**
 * Config levels:
 *   silly: 0,
 *   debug: 1,
 *   verbose: 2,
 *   info: 3,
 *   warn: 4,
 *   error: 5
 */

winston.emitErrs = true;

winston.Logger.prototype.activate = function(level) {
    for (let prop in this.transports) {
        this.transports[prop].silent = false;
        if (level) {
            this.transports[prop].level = level;
        }
    }
};

let logConsole = new winston.Logger({
    transports: [
        new winston.transports.Console({
            silent: true,
            level: 'info',
            handleExceptions: false,
            json: false,
            prettyPrint: true,
            colorize: true
        })
    ],
    exitOnError: false
});

let logFile = new winston.Logger({
    transports: [
        new winston.transports.File({
            silent: true,
            level: 'info',
            filename: 'error.log',
            zippedArchive: true,
            tailable : true,
            // prettyPrint: true,
            handleExceptions: false,
            json: false,
            maxsize: 5242880, //5MB
            maxFiles: 5
        })
    ],
    exitOnError: false
})

export { logConsole, logFile };
