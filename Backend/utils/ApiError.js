class ApiError extends Error {
    constructor(statusCode, message = 'Something went wrong', errors = [], stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = Array.isArray(errors) ? errors : [errors];
        this.isOperational = true;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

class BadRequestError extends ApiError {
    constructor(message = 'Bad Request', errors = []) {
        super(400, message, errors);
    }
}

class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized access', errors = []) {
        super(401, message, errors);
    }
}

class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden access', errors = []) {
        super(403, message, errors);
    }
}

class NotFoundError extends ApiError {
    constructor(message = 'Resource not found', errors = []) {
        super(404, message, errors);
    }
}

class ConflictError extends ApiError {
    constructor(message = 'Conflict: Resource already exists', errors = []) {
        super(409, message, errors);
    }
}

class InternalServerError extends ApiError {
    constructor(message = 'Internal Server Error', errors = []) {
        super(500, message, errors);
    }
}

module.exports = {
    ApiError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    InternalServerError,
};
