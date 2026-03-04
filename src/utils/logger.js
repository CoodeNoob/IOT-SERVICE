const winston = require('winston');
const path = require('path');

//LOG LEVEL
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
}

//colors to winston
winston.addColors(colors);



// LOG FORMAT
const format = winston.format.combine(
    // Add timestamp
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),

    // Add colors for console
    winston.format.colorize({ all: true }),

    // Define the log message format
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

// Define transports (where logs are stored)
const transports = [
    // Console transport
    new winston.transports.Console(),

    // Error log file
    new winston.transports.File({
        filename: path.join(__dirname, 'logs/error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),

    // Combined log file for all logs
    new winston.transports.File({
        filename: path.join(__dirname, 'logs/combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
];


// Create the logger
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    levels,
    format,
    transports,
});


module.exports = logger;