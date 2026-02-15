const { ERROR_MESSAGES } = require('../constants/errorConstants');

/**
 * Custom Error Classes with proper status codes
 */
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD) {
        super(message, 400);
    }
}

class NotFoundError extends AppError {
    constructor(message = ERROR_MESSAGES.SERVER.NOT_FOUND) {
        super(message, 404);
    }
}

class AuthenticationError extends AppError {
    constructor(message = ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS) {
        super(message, 401);
    }
}

class AuthorizationError extends AppError {
    constructor(message = ERROR_MESSAGES.AUTH.FORBIDDEN) {
        super(message, 403);
    }
}

class DatabaseError extends AppError {
    constructor(message = ERROR_MESSAGES.SERVER.DATABASE_ERROR) {
        super(message, 500);
    }
}

/**
 * ErrorHandler Utility Class
 * Provides static methods for consistent error handling
 */
class ErrorHandler {
    /**
     * Throw a custom error
     * @param {String} message - Error message
     * @param {Number} statusCode - HTTP status code
     * @throws {AppError}
     */
    static throwError(message, statusCode = 500) {
        throw new AppError(message, statusCode);
    }

    /**
     * Throw a validation error
     * @param {String} message - Error message
     * @throws {ValidationError}
     */
    static throwValidationError(message) {
        throw new ValidationError(message);
    }

    /**
     * Throw a not found error
     * @param {String} message - Error message
     * @throws {NotFoundError}
     */
    static throwNotFoundError(message) {
        throw new NotFoundError(message);
    }

    /**
     * Throw an authentication error
     * @param {String} message - Error message
     * @throws {AuthenticationError}
     */
    static throwAuthError(message) {
        throw new AuthenticationError(message);
    }

    /**
     * Throw an authorization error
     * @param {String} message - Error message
     * @throws {AuthorizationError}
     */
    static throwAuthorizationError(message) {
        throw new AuthorizationError(message);
    }

    /**
     * Throw a database error
     * @param {String} message - Error message
     * @throws {DatabaseError}
     */
    static throwDatabaseError(message) {
        throw new DatabaseError(message);
    }

    /**
     * Handle and format errors
     * Maps common error types to appropriate status codes
     * @param {Error} error - Original error
     * @returns {AppError} - Formatted error with status code
     */
    static handleError(error) {
        // If already an AppError, return as is
        if (error instanceof AppError) {
            return error;
        }

        // MongoDB validation errors
        if (error.name === 'ValidationError') {
            return new ValidationError(error.message);
        }

        // MongoDB cast errors (invalid ID format)
        if (error.name === 'CastError') {
            return new ValidationError(ERROR_MESSAGES.VALIDATION.INVALID_FORMAT);
        }

        // MongoDB duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            const message = field === 'email'
                ? ERROR_MESSAGES.AUTH.EMAIL_IN_USE
                : ERROR_MESSAGES.VALIDATION.DUPLICATE_ENTRY;
            return new ValidationError(message);
        }

        // Default to internal server error
        return new AppError(
            error.message || ERROR_MESSAGES.SERVER.INTERNAL_ERROR,
            error.statusCode || 500
        );
    }

    /**
     * Wrap async functions with error handling
     * @param {Function} fn - Async function to wrap
     * @returns {Function} - Wrapped function
     */
    static asyncWrapper(fn) {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                throw ErrorHandler.handleError(error);
            }
        };
    }
}

module.exports = {
    ErrorHandler,
    AppError,
    ValidationError,
    NotFoundError,
    AuthenticationError,
    AuthorizationError,
    DatabaseError,
};
