const BaseService = require('../BaseService');
const Entry = require('../../models/Entry');
const { ErrorHandler } = require('../../utils/ErrorHandler');
const { ERROR_MESSAGES } = require('../../constants/errorConstants');

/**
 * EntryService - Handles all entry-related operations
 * Extends BaseService for standard CRUD operations
 */
class EntryService extends BaseService {
    constructor() {
        super(Entry);
    }

    /**
     * Create a new entry
     * @param {String} userId - User ID
     * @param {Object} entryData - Entry data
     * @returns {Promise<Object>} - Created entry
     */
    async createEntry(userId, entryData) {
        const { date, dayType, rows } = entryData;

        if (!date || !dayType || !rows) {
            ErrorHandler.throwValidationError(ERROR_MESSAGES.ENTRY.REQUIRED_FIELDS);
        }

        return await this.create({
            user: userId,
            date,
            dayType,
            entries: rows
        });
    }

    /**
     * Get entries for a specific user
     * @param {String} userId - User ID
     * @param {Object} options - Query options (limit, sort, date filters)
     * @returns {Promise<Array>} - User entries
     */
    async getUserEntries(userId, options = {}) {
        const filter = { user: userId };

        // Add date filtering if provided
        if (options.startDate || options.endDate) {
            filter.date = {};
            if (options.startDate) filter.date.$gte = new Date(options.startDate);
            if (options.endDate) filter.date.$lte = new Date(options.endDate);
        }

        return await this.findAll(filter, {
            sort: options.sort || { date: -1 },
            limit: options.limit,
            skip: options.skip
        });
    }

    /**
     * Get recent entries for a user
     * @param {String} userId - User ID
     * @param {Number} limit - Number of entries to fetch
     * @returns {Promise<Array>} - Recent entries
     */
    async getRecentEntries(userId, limit = 5) {
        return await this.getUserEntries(userId, {
            limit,
            sort: { date: -1 }
        });
    }

    /**
     * Update an entry
     * @param {String} entryId - Entry ID
     * @param {String} userId - User ID (for authorization)
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} - Updated entry
     */
    async updateEntry(entryId, userId, updateData) {
        const entry = await this.findById(entryId);

        if (!entry) {
            ErrorHandler.throwNotFoundError(ERROR_MESSAGES.ENTRY.NOT_FOUND);
        }

        // Verify user owns this entry
        if (entry.user.toString() !== userId.toString()) {
            ErrorHandler.throwAuthorizationError(ERROR_MESSAGES.ENTRY.UNAUTHORIZED_UPDATE);
        }

        return await this.update(entryId, updateData);
    }

    /**
     * Delete an entry
     * @param {String} entryId - Entry ID
     * @param {String} userId - User ID (for authorization)
     * @returns {Promise<Object>} - Deleted entry
     */
    async deleteEntry(entryId, userId) {
        const entry = await this.findById(entryId);

        if (!entry) {
            ErrorHandler.throwNotFoundError(ERROR_MESSAGES.ENTRY.NOT_FOUND);
        }

        // Verify user owns this entry
        if (entry.user.toString() !== userId.toString()) {
            ErrorHandler.throwAuthorizationError(ERROR_MESSAGES.ENTRY.UNAUTHORIZED_DELETE);
        }

        return await this.delete(entryId);
    }

    /**
     * Get entries within a date range
     * @param {String} userId - User ID
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Promise<Array>} - Entries in range
     */
    async getEntriesByDateRange(userId, startDate, endDate) {
        return await this.getUserEntries(userId, { startDate, endDate });
    }
}

module.exports = new EntryService();
