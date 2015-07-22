var winston = require('winston');
winston.emitErrs = true;

var log = new winston.Logger({
    transports: [
        //new winston.transports.File({
        //    level: 'warn',
        //    filename: 'going.log',
        //    handleExceptions: false,
        //    json: true,
        //    maxsize: 5242880, //5MB
        //    maxFiles: 5,
        //    colorize: false
        //}),
        new winston.transports.Console({
            level: 'info',
            handleExceptions: false,
            json: false,
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
