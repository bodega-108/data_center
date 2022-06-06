const { createLogger, transports,format } = require('winston');

const logger = createLogger({
    format: format.printf((info)=>{
        return `[${info.level.toUpperCase()}] - ${info.message}`;
    }),
    level: 'debug',
    transports:[
        new transports.Console()
        ]
});

module.exports =  logger;