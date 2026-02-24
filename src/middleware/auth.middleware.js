const jwt = require('jsonwebtoken');
const Response = require('../utils/ApiResponses')
const jwtService = require('../utils/jwt');

function authValidate(req, res, next) {
    const header = req.headers.authorization;

    if (!header) return Response.error(res, "No Token!");

    //extract token
    const token = header.split(" ")[1];

    try {
        const decoded = jwtService.verifyAccessToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        Response.error(res, message = error.message, errorCode = 405);
    }
}

function authorizeRole(...allowedRoles) {
    return (req, res, next) => {

        if (!req.user) {
            return Response.error(res, "Unauthorized", 401);
        }

        if (!allowedRoles.includes(req.user.role)) {
            return Response.error(res, "Forbidden - Access Denied", 403);
        }

        next();
    };
}


module.exports = {
    authValidate,
    authorizeRole
}