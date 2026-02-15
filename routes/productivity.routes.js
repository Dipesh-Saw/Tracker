const express = require('express');
const router = express.Router();
const productivityService = require('../services/productivity/ProductivityService');
const { isAuthenticated } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');

/**
 * GET /api/productivity - Get productivity statistics
 * Query params: range (24h, 1w, 1m)
 */
router.get('/api/productivity', isAuthenticated, asyncHandler(async (req, res) => {
    const range = req.query.range || '1w';

    const stats = await productivityService.getProductivityStats(
        req.session.userId,
        range
    );

    res.json({ success: true, data: stats });
}));

/**
 * GET /api/productivity/comparison - Get productivity comparison across multiple ranges
 */
router.get('/api/productivity/comparison', isAuthenticated, asyncHandler(async (req, res) => {
    const comparison = await productivityService.getProductivityComparison(
        req.session.userId
    );

    res.json({ success: true, data: comparison });
}));

/**
 * GET /api/productivity/top-metrics - Get top performing metrics
 * Query params: range (24h, 1w, 1m)
 */
router.get('/api/productivity/top-metrics', isAuthenticated, asyncHandler(async (req, res) => {
    const range = req.query.range || '1w';

    const topMetrics = await productivityService.getTopMetrics(
        req.session.userId,
        range
    );

    res.json({ success: true, data: topMetrics });
}));

module.exports = router;
