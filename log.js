var winston = require('winston');
winston.emitErrs = true;

var log = new winston.Logger({
    transports: [
        //new winston.transports.File({
        //    level: 'warn',
        //    filename: 'error.log',
        //    handleExceptions: false,
        //    json: false,
        //    maxsize: 5242880, //5MB
        //    maxFiles: 5
        //}),
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

module.exports = log;

//npmConfig.levels = {
//    silly: 0,
//    debug: 1,
//    verbose: 2,
//    info: 3,
//    warn: 4,
//    error: 5
//};
