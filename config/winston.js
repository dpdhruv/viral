let winston = require('winston');

var options = {
    console:    {
        level: 'info',
        handleExceptions: true,
        json: false,
        format: winston.format.combine(
            winston.format.colorize(), 
            winston.format.simple(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(
              info =>
                `${info.timestamp} ${info.level} : ${info.message}`
            ))
    }
};


var logger = new winston.createLogger({
    transports: [
        new winston.transports.Console(options.console)
    ],
    exitOnError: false
});

logger.stream = {
    write: (message, encoding) => {
        logger.info(message);
    }
}

module.exports = logger;