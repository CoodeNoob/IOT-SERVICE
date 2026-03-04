const logger = require('../utils/logger');

const httpLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.originalUrl || req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.connection.remoteAddress,
            // userAgent: req.get('User-Agent'),
        };

        const message = `${logData.method} ${logData.url} ${logData.status} ${logData.duration}`;


        if (res.statusCode >= 500) {
            logger.error(message, logData);
        } else if (res.statusCode >= 400) {
            logger.warn(message, logData);
        } else {
            logger.http(message, logData);
        }
    })
    next();
}


// Detailed error logging middleware
const errorLogger = (err, req, res, next) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        body: req.body,
        params: req.params,
        query: req.query,
        user: req.user,
        timestamp: new Date().toISOString(),
    });

    next(err);
};

// Request/Response debug logger
const debugLogger = (req, res, next) => {
    logger.debug(`Request Body: ${JSON.stringify(req.body)}`);
    logger.debug(`Request Params: ${JSON.stringify(req.params)}`);
    logger.debug(`Request Query: ${JSON.stringify(req.query)}`);
    next();
};

module.exports = {
    httpLogger,
    errorLogger,
    debugLogger,
};