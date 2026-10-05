const { ApiError, NotFoundError } = require('../utils/ApiError');

// 404 Route Not Found Middleware
const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(error);
};

// Global Error Handling Middleware
const errorHandler = (err, req, res, next) => {
    let error = err;

    // Check if error is not an instance of ApiError
    if (!(error instanceof ApiError)) {
        let statusCode = error.statusCode || 500;
        let message = error.message || 'Internal Server Error';
        let errors = [];

        // Handle Mongoose CastError (e.g., invalid ObjectId)
        if (error.name === 'CastError') {
            statusCode = 400;
            message = `Invalid format for field '${error.path}': '${error.value}'`;
        }

        // Handle Mongoose Duplicate Key Error (code 11000)
        else if (error.code === 11000) {
            statusCode = 409;
            const duplicateField = Object.keys(error.keyValue || {})[0] || 'field';
            message = `A record with this ${duplicateField} already exists.`;
        }

        // Handle Mongoose Validation Error
        else if (error.name === 'ValidationError') {
            statusCode = 400;
            errors = Object.values(error.errors || {}).map((val) => val.message);
            message = errors.length > 0 ? errors.join(', ') : 'Validation failed';
        }

        // Handle JWT Errors
        else if (error.name === 'JsonWebTokenError') {
            statusCode = 401;
            message = 'Invalid authentication token. Please log in again.';
        } else if (error.name === 'TokenExpiredError') {
            statusCode = 401;
            message = 'Your session has expired. Please log in again.';
        }

        error = new ApiError(statusCode, message, errors, error.stack);
    }

    // Prepare response payload
    const response = {
        success: false,
        statusCode: error.statusCode || 500,
        message: error.message || 'An unexpected error occurred',
        errors: error.errors && error.errors.length > 0 ? error.errors : undefined,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };

    // Log unexpected (500) internal errors in console for debugging
    if (response.statusCode >= 500) {
        console.error('SERVER ERROR [500]:', err);
    }

    return res.status(response.statusCode).json(response);
};

module.exports = {
    notFoundHandler,
    errorHandler
};
