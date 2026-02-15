const User = require('../models/User');

/**
 * Check if user is authenticated
 * Redirect to login if not authenticated
 */
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/auth/login');
};

/**
 * Check if user is a guest (not authenticated)
 * Redirect to dashboard if already authenticated
 */
const isGuest = (req, res, next) => {
    if (!req.session.userId) {
        return next();
    }
    res.redirect('/');
};

/**
 * Make user data available in views
 * Attaches user to res.locals if authenticated
 */
const attachUser = async (req, res, next) => {
    try {
        if (req.session.userId) {
            res.locals.user = await User.findById(req.session.userId);
        } else {
            res.locals.user = null;
        }
        next();
    } catch (err) {
        console.error('Error attaching user to locals:', err);
        res.locals.user = null;
        next();
    }
};

/**
 * API authentication middleware
 * Returns JSON error instead of redirecting
 */
const isAuthenticatedAPI = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.status(401).json({
        success: false,
        error: { message: 'Authentication required' }
    });
};

module.exports = {
    isAuthenticated,
    isGuest,
    attachUser,
    isAuthenticatedAPI
};
