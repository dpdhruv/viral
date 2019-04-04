const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const fs = require('fs');

const env = process.env.NODE_ENV || 'development';
const logDir = 'log';

if(!fs.existsSync(logDir))  {
    fs.mkdirSync(logDir);
}


const dailyRotateFileTransport = new transports.DailyRotateFile({
    filename: `${logDir}/%DATE%-results.log`,
    datePattern: '',
  });
  
  const logger = createLogger({
    // change level if in dev environment versus production
    level: env === 'development' ? 'verbose' : 'info',
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
      new transports.Console({
        level: 'info',
        format: format.combine(
          format.colorize(),
          format.printf(
            info => `${info.timestamp} ${info.level}: ${info.message}`
          )
        )
      }),
      dailyRotateFileTransport
    ]
  });
  

logger.stream = {
    write: function(message, encoding) {
      // use the 'info' log level so the output will be picked up by both transports (file and console)
      logger.info(message);
    },
  };
module.exports = logger;
