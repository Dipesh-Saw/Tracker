const { ErrorHandler, ValidationError, NotFoundError, AuthenticationError, AuthorizationError } = require('../utils/ErrorHandler');

/**
 * Centralized error handling middleware
 * Formats errors and sends appropriate HTTP responses
 */
const errorHandler = (err, req, res, next) => {
    // Process error through ErrorHandler
    const error = ErrorHandler.handleError(err);

    // Log error for debugging
    console.error('Error:', {
        name: error.name,
        message: error.message,
        statusCode: error.statusCode,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    // Check if it's an API request (JSON response)
    if (req.path.startsWith('/api/')) {
        return res.status(statusCode).json({
            success: false,
            error: {
                message,
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
            }
        });
    }

    // For web routes, render error page or redirect
    if (statusCode === 401) {
        return res.redirect('/auth/login');
    }

    // Render error view
    res.status(statusCode).render('error', {
        error: message,
        statusCode
    });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(error);
};

/**
 * Async route handler wrapper
 * Catches async errors and passes to error middleware
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    ValidationError,
    NotFoundError,
    AuthenticationError,
    AuthorizationError,
    errorHandler,
    notFoundHandler,
    asyncHandler,
};
