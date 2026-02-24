const jwt = require('jsonwebtoken');

function generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m'
    });
}

function generateRefreshToken(payload) {
    return jwt.sign({ ...payload, tokenType: 'refresh' }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d'
    });
}

function verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

function verifyRefreshToken(token) {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (decoded.tokenType !== 'refresh') {
        throw new Error('Invalid token type');
    }
    return decoded;
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};
