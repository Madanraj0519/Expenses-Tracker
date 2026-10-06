const jwt = require('jsonwebtoken');
const { UnauthorizedError, InternalServerError } = require('../utils/ApiError');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.split(' ')[1] 
        : authHeader;

    if (!token) {
        return next(new UnauthorizedError('Access denied. No authentication token provided.'));
    }
    if (!process.env.JWT_SECRET_TOKEN) {
        return next(new InternalServerError('Authentication is not configured on the server.'));
    }

    jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return next(new UnauthorizedError('Session expired. Please log in again.'));
            }
            return next(new UnauthorizedError('Invalid authentication token. Please log in again.'));
        }

        req.user = user;
        next();
    });
};

module.exports = {
    verifyToken
};