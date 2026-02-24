class ApiResponse {
    static success(res, data = null, message = 'Success', statusCode = 200) {
        const response = {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        };

        return res.status(statusCode).json(response);
    }

    static error(res, message = 'An error occurred', statusCode = 400, errors = null, errorCode = null) {
        const response = {
            success: false,
            message,
            timestamp: new Date().toISOString()
        };

        if (errorCode) {
            response.errorCode = errorCode;
        }

        if (errors) {
            response.errors = errors;
        }

        return res.status(statusCode).json(response);
    }
}

module.exports = ApiResponse;