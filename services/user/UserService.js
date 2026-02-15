const BaseService = require('../BaseService');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const { ErrorHandler } = require('../../utils/ErrorHandler');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../../constants/errorConstants');

/**
 * UserService - Handles all user-related operations
 * Extends BaseService for standard CRUD operations
 */
class UserService extends BaseService {
    constructor() {
        super(User);
    }

    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} - Created user
     */
    async register(userData) {
        const { username, email, password } = userData;

        // Validate required fields
        if (!username || !email || !password) {
            ErrorHandler.throwValidationError(
                !username ? ERROR_MESSAGES.AUTH.USERNAME_REQUIRED :
                    !email ? ERROR_MESSAGES.AUTH.EMAIL_REQUIRED :
                        ERROR_MESSAGES.AUTH.PASSWORD_REQUIRED
            );
        }

        // Check if user already exists
        const existingUser = await this.findOne({ email });
        if (existingUser) {
            ErrorHandler.throwValidationError(ERROR_MESSAGES.AUTH.EMAIL_IN_USE);
        }

        // Create new user (password will be hashed by User model pre-save hook)
        return await this.create({ username, email, password });
    }

    /**
     * Authenticate user login
     * @param {String} email - User email
     * @param {String} password - User password
     * @returns {Promise<Object>} - Authenticated user
     */
    async login(email, password) {
        if (!email || !password) {
            ErrorHandler.throwValidationError(
                !email ? ERROR_MESSAGES.AUTH.EMAIL_REQUIRED :
                    ERROR_MESSAGES.AUTH.PASSWORD_REQUIRED
            );
        }

        const user = await this.findOne({ email });
        if (!user) {
            ErrorHandler.throwAuthError(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            ErrorHandler.throwAuthError(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
        }

        return user;
    }

    /**
     * Update user profile
     * @param {String} userId - User ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} - Updated user
     */
    async updateProfile(userId, updateData) {
        // Remove sensitive fields from update
        const { password, resetToken, resetTokenExpiry, ...safeData } = updateData;

        if (Object.keys(safeData).length === 0) {
            ErrorHandler.throwValidationError(ERROR_MESSAGES.USER.PROFILE_UPDATE_REQUIRED);
        }

        const updatedUser = await this.update(userId, safeData);

        if (!updatedUser) {
            ErrorHandler.throwNotFoundError(ERROR_MESSAGES.USER.NOT_FOUND);
        }

        return updatedUser;
    }

    /**
     * Change user password
     * @param {String} userId - User ID
     * @param {String} currentPassword - Current password
     * @param {String} newPassword - New password
     * @returns {Promise<Object>} - Updated user
     */
    async changePassword(userId, currentPassword, newPassword) {
        if (!currentPassword || !newPassword) {
            ErrorHandler.throwValidationError(ERROR_MESSAGES.USER.PASSWORD_UPDATE_REQUIRED);
        }

        const user = await this.findById(userId);
        if (!user) {
            ErrorHandler.throwNotFoundError(ERROR_MESSAGES.USER.NOT_FOUND);
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            ErrorHandler.throwAuthError(ERROR_MESSAGES.AUTH.CURRENT_PASSWORD_INCORRECT);
        }

        user.password = newPassword; // Will be hashed by pre-save hook
        await user.save();
        return user;
    }

    /**
     * Get user by email
     * @param {String} email - User email
     * @returns {Promise<Object|null>} - User or null
     */
    async findByEmail(email) {
        return await this.findOne({ email });
    }
}

module.exports = new UserService();
