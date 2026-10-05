const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('../utils/ApiError');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.split(' ')[1] 
        : authHeader;

    if (!token) {
        return next(new UnauthorizedError('Access denied. No authentication token provided.'));
    }

    jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return next(new UnauthorizedError('Session expired. Please log in again.'));
            }
            return next(new ForbiddenError('Invalid token. Authorization failed.'));
        }

        req.user = user;
        next();
    });
};

module.exports = {
    verifyToken
};