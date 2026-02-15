const express = require('express');
const router = express.Router();
const entryService = require('../services/entry/EntryService');
const { isAuthenticated } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../constants/errorConstants');

/**
 * POST /api/entry - Create new entry
 */
router.post('/api/entry', isAuthenticated, asyncHandler(async (req, res) => {
    const { date, dayType, rows } = req.body;

    const entry = await entryService.createEntry(req.session.userId, {
        date,
        dayType,
        rows
    });

    res.json({
        success: true,
        message: SUCCESS_MESSAGES.ENTRY.CREATED,
        data: entry
    });
}));

/**
 * GET /api/entry - Get all entries for user
 */
router.get('/api/entry', isAuthenticated, asyncHandler(async (req, res) => {
    const { limit, skip, startDate, endDate } = req.query;

    const entries = await entryService.getUserEntries(req.session.userId, {
        limit: limit ? parseInt(limit) : undefined,
        skip: skip ? parseInt(skip) : undefined,
        startDate,
        endDate
    });

    res.json({ success: true, data: entries });
}));

/**
 * GET /api/entry/recent - Get recent entries for user
 */
router.get('/api/entry/recent', isAuthenticated, asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;

    const entries = await entryService.getRecentEntries(req.session.userId, limit);

    res.json({ success: true, data: entries });
}));

/**
 * GET /api/entry/:id - Get entry by ID
 */
router.get('/api/entry/:id', isAuthenticated, asyncHandler(async (req, res) => {
    const entry = await entryService.findById(req.params.id);

    if (!entry) {
        return res.status(404).json({
            success: false,
            error: { message: ERROR_MESSAGES.ENTRY.NOT_FOUND }
        });
    }

    // Verify user owns this entry
    if (entry.user.toString() !== req.session.userId.toString()) {
        return res.status(403).json({
            success: false,
            error: { message: ERROR_MESSAGES.ENTRY.UNAUTHORIZED_ACCESS }
        });
    }

    res.json({ success: true, data: entry });
}));

/**
 * PATCH /api/entry/:id - Update entry
 */
router.patch('/api/entry/:id', isAuthenticated, asyncHandler(async (req, res) => {
    const entry = await entryService.updateEntry(
        req.params.id,
        req.session.userId,
        req.body
    );

    res.json({
        success: true,
        message: SUCCESS_MESSAGES.ENTRY.UPDATED,
        data: entry
    });
}));

/**
 * DELETE /api/entry/:id - Delete entry
 */
router.delete('/api/entry/:id', isAuthenticated, asyncHandler(async (req, res) => {
    await entryService.deleteEntry(req.params.id, req.session.userId);

    res.json({
        success: true,
        message: SUCCESS_MESSAGES.ENTRY.DELETED
    });
}));

module.exports = router;
