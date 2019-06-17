const winston = require('winston');
const useragent = require('useragent');
const moment = require('moment-timezone');

const timestamp = winston.format((info) => {
    info.timestamp = moment().tz('America/Fortaleza').format();
    return info;
});

const agent = winston.format((info) => {
    const user = useragent.parse(info.agent);
    info.agent = { agent: user.toAgent(), os: user.os.toString() };
    return info;
});

const logger = winston.createLogger({
    transports: [
        new winston.transports.File({
            filename: 'error.log',
            level: 'error',
            format: winston.format.combine(
                timestamp(),
                agent(),
                winston.format.json(),
            ),
        }),
        new winston.transports.File({
            filename: 'logger.log',
            level: 'info',
            format: winston.format.combine(
                timestamp(),
                agent(),
                winston.format.json(),
            ),
        }),
    ],
});

module.exports = logger;
