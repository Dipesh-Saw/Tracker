const Entry = require('../../models/Entry');
const { ErrorHandler } = require('../../utils/ErrorHandler');
const { ERROR_MESSAGES } = require('../../constants/errorConstants');

/**
 * ProductivityService - Handles productivity analytics and reporting
 */
class ProductivityService {
    /**
     * Get time range boundaries
     * @param {String} range - Time range ('24h', '1w', '1m')
     * @returns {Object} - Start and end dates
     */
    getTimeRange(range) {
        const now = new Date();
        const startDate = new Date();

        switch (range) {
            case '24h':
                startDate.setHours(now.getHours() - 24);
                break;
            case '1w':
                startDate.setDate(now.getDate() - 7);
                break;
            case '1m':
                startDate.setMonth(now.getMonth() - 1);
                break;
            default:
                ErrorHandler.throwValidationError(ERROR_MESSAGES.PRODUCTIVITY.INVALID_RANGE);
        }

        return { startDate, endDate: now };
    }

    /**
     * Get productivity statistics for a user
     * @param {String} userId - User ID
     * @param {String} range - Time range ('24h', '1w', '1m')
     * @returns {Promise<Object>} - Productivity statistics
     */
    async getProductivityStats(userId, range = '1w') {
        try {
            const { startDate, endDate } = this.getTimeRange(range);

            const entries = await Entry.find({
                user: userId,
                date: { $gte: startDate, $lte: endDate }
            }).sort({ date: 1 });

            // Calculate overall statistics
            let totalDocuments = 0;
            let totalTime = 0;
            const platformStats = {};
            const docTypeStats = {};
            const queueStats = {};
            const dailyStats = [];

            // Group entries by date for timeline
            const entriesByDate = {};

            entries.forEach(entry => {
                const dateKey = entry.date.toISOString().split('T')[0];

                if (!entriesByDate[dateKey]) {
                    entriesByDate[dateKey] = {
                        date: dateKey,
                        documents: 0,
                        time: 0,
                        entries: []
                    };
                }

                entry.entries.forEach(item => {
                    const docs = item.count || 0;
                    const time = item.timeInMins || 0;

                    // Overall totals
                    totalDocuments += docs;
                    totalTime += time;

                    // Daily stats
                    entriesByDate[dateKey].documents += docs;
                    entriesByDate[dateKey].time += time;

                    // Platform breakdown
                    if (item.platform) {
                        platformStats[item.platform] = (platformStats[item.platform] || 0) + docs;
                    }

                    // Doc type breakdown
                    if (item.docType) {
                        docTypeStats[item.docType] = (docTypeStats[item.docType] || 0) + docs;
                    }

                    // Queue breakdown
                    if (item.queue) {
                        queueStats[item.queue] = (queueStats[item.queue] || 0) + docs;
                    }
                });
            });

            // Convert daily stats to array
            Object.values(entriesByDate).forEach(dayStat => {
                dailyStats.push(dayStat);
            });

            // Calculate averages
            const daysInRange = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            const avgDocumentsPerDay = daysInRange > 0 ? (totalDocuments / daysInRange).toFixed(2) : 0;
            const avgTimePerDay = daysInRange > 0 ? (totalTime / daysInRange).toFixed(2) : 0;
            const avgTimePerDocument = totalDocuments > 0 ? (totalTime / totalDocuments).toFixed(2) : 0;

            return {
                range,
                startDate,
                endDate,
                summary: {
                    totalDocuments,
                    totalTime,
                    totalTimeHours: (totalTime / 60).toFixed(2),
                    avgDocumentsPerDay: parseFloat(avgDocumentsPerDay),
                    avgTimePerDay: parseFloat(avgTimePerDay),
                    avgTimePerDocument: parseFloat(avgTimePerDocument),
                    daysActive: Object.keys(entriesByDate).length
                },
                breakdown: {
                    byPlatform: platformStats,
                    byDocType: docTypeStats,
                    byQueue: queueStats
                },
                timeline: dailyStats
            };
        } catch (error) {
            if (error.name === 'ValidationError' || error.statusCode) {
                throw error;
            }
            ErrorHandler.throwError(ERROR_MESSAGES.PRODUCTIVITY.CALCULATION_ERROR, 500);
        }
    }

    /**
     * Get productivity comparison across multiple time ranges
     * @param {String} userId - User ID
     * @returns {Promise<Object>} - Comparison data
     */
    async getProductivityComparison(userId) {
        const ranges = ['24h', '1w', '1m'];
        const comparison = {};

        for (const range of ranges) {
            comparison[range] = await this.getProductivityStats(userId, range);
        }

        return comparison;
    }

    /**
     * Get top performing metrics
     * @param {String} userId - User ID
     * @param {String} range - Time range
     * @returns {Promise<Object>} - Top metrics
     */
    async getTopMetrics(userId, range = '1w') {
        const stats = await this.getProductivityStats(userId, range);

        // Sort platforms, doc types, and queues by count
        const topPlatforms = Object.entries(stats.breakdown.byPlatform)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const topDocTypes = Object.entries(stats.breakdown.byDocType)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const topQueues = Object.entries(stats.breakdown.byQueue)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return {
            topPlatforms: topPlatforms.map(([name, count]) => ({ name, count })),
            topDocTypes: topDocTypes.map(([name, count]) => ({ name, count })),
            topQueues: topQueues.map(([name, count]) => ({ name, count }))
        };
    }
}

module.exports = new ProductivityService();
