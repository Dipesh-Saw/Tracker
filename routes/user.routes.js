const express = require('express');
const router = express.Router();
const userService = require('../services/user/UserService');
const { isAuthenticated, isGuest } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../constants/errorConstants');

// --- Authentication Routes ---

/**
 * GET /auth/login - Login page
 */
router.get('/auth/login', isGuest, (req, res) => {
    res.render('login', { error: null });
});

/**
 * POST /auth/login - Process login
 */
router.post('/auth/login', isGuest, asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userService.login(email, password);
        req.session.userId = user._id;
        res.redirect('/');
    } catch (error) {
        res.render('login', { error: error.message });
    }
}));

/**
 * GET /auth/register - Registration page
 */
router.get('/auth/register', isGuest, (req, res) => {
    res.render('register', { error: null });
});

/**
 * POST /auth/register - Process registration
 */
router.post('/auth/register', isGuest, asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const user = await userService.register({ username, email, password });
        req.session.userId = user._id;
        res.redirect('/');
    } catch (error) {
        res.render('register', { error: error.message });
    }
}));

/**
 * GET /auth/logout - Logout user
 */
router.get('/auth/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});

/**
 * GET /auth/forgot-password - Forgot password page
 */
router.get('/auth/forgot-password', isGuest, (req, res) => {
    res.render('forgot-password', { message: null, error: null });
});

// --- User API Routes ---

/**
 * GET /api/user/:id - Get user by ID
 */
router.get('/api/user/:id', isAuthenticated, asyncHandler(async (req, res) => {
    const user = await userService.findById(req.params.id, { select: '-password' });

    if (!user) {
        return res.status(404).json({
            success: false,
            error: { message: ERROR_MESSAGES.USER.NOT_FOUND }
        });
    }

    res.json({ success: true, data: user });
}));

/**
 * PATCH /api/user/:id - Update user profile
 */
router.patch('/api/user/:id', isAuthenticated, asyncHandler(async (req, res) => {
    // Verify user is updating their own profile
    if (req.params.id !== req.session.userId.toString()) {
        return res.status(403).json({
            success: false,
            error: { message: ERROR_MESSAGES.AUTH.FORBIDDEN }
        });
    }

    const user = await userService.updateProfile(req.params.id, req.body);
    res.json({
        success: true,
        message: SUCCESS_MESSAGES.USER.PROFILE_UPDATED,
        data: user
    });
}));

/**
 * DELETE /api/user/:id - Delete user account
 */
router.delete('/api/user/:id', isAuthenticated, asyncHandler(async (req, res) => {
    // Verify user is deleting their own account
    if (req.params.id !== req.session.userId.toString()) {
        return res.status(403).json({
            success: false,
            error: { message: ERROR_MESSAGES.AUTH.FORBIDDEN }
        });
    }

    await userService.delete(req.params.id);
    req.session.destroy();
    res.json({
        success: true,
        message: SUCCESS_MESSAGES.USER.ACCOUNT_DELETED
    });
}));

/**
 * POST /api/user/change-password - Change user password
 */
router.post('/api/user/change-password', isAuthenticated, asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    await userService.changePassword(req.session.userId, currentPassword, newPassword);
    res.json({
        success: true,
        message: SUCCESS_MESSAGES.AUTH.PASSWORD_CHANGED
    });
}));

module.exports = router;
