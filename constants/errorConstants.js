/**
 * Error Messages Constants
 * Centralized error messages for the entire application
 */

const ERROR_MESSAGES = {
    // Authentication Errors
    AUTH: {
        INVALID_CREDENTIALS: 'Invalid email or password',
        EMAIL_REQUIRED: 'Email is required',
        PASSWORD_REQUIRED: 'Password is required',
        USERNAME_REQUIRED: 'Username is required',
        EMAIL_IN_USE: 'Email already in use',
        REGISTRATION_FAILED: 'Registration failed. Please try again',
        LOGIN_FAILED: 'Login failed. Please try again',
        UNAUTHORIZED: 'Authentication required',
        FORBIDDEN: 'You do not have permission to access this resource',
        SESSION_EXPIRED: 'Your session has expired. Please login again',
        INVALID_TOKEN: 'Invalid or expired token',
        CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',
    },

    // User Errors
    USER: {
        NOT_FOUND: 'User not found',
        CREATION_FAILED: 'Failed to create user',
        UPDATE_FAILED: 'Failed to update user profile',
        DELETE_FAILED: 'Failed to delete user account',
        PROFILE_UPDATE_REQUIRED: 'Please provide data to update',
        PASSWORD_UPDATE_REQUIRED: 'Current password and new password are required',
        INVALID_USER_ID: 'Invalid user ID',
    },

    // Entry Errors
    ENTRY: {
        NOT_FOUND: 'Entry not found',
        CREATION_FAILED: 'Failed to create entry',
        UPDATE_FAILED: 'Failed to update entry',
        DELETE_FAILED: 'Failed to delete entry',
        REQUIRED_FIELDS: 'Date, dayType, and rows are required',
        INVALID_ENTRY_ID: 'Invalid entry ID',
        UNAUTHORIZED_UPDATE: 'Unauthorized to update this entry',
        UNAUTHORIZED_DELETE: 'Unauthorized to delete this entry',
        UNAUTHORIZED_ACCESS: 'Unauthorized to access this entry',
    },

    // Productivity Errors
    PRODUCTIVITY: {
        FETCH_FAILED: 'Failed to fetch productivity statistics',
        INVALID_RANGE: 'Invalid time range. Use 24h, 1w, or 1m',
        NO_DATA: 'No productivity data available for the selected range',
        CALCULATION_ERROR: 'Error calculating productivity metrics',
    },

    // Validation Errors
    VALIDATION: {
        REQUIRED_FIELD: 'This field is required',
        INVALID_EMAIL: 'Please provide a valid email address',
        INVALID_DATE: 'Please provide a valid date',
        INVALID_NUMBER: 'Please provide a valid number',
        MIN_LENGTH: 'Minimum length requirement not met',
        MAX_LENGTH: 'Maximum length exceeded',
        INVALID_FORMAT: 'Invalid format',
        DUPLICATE_ENTRY: 'Duplicate entry detected',
    },

    // Server Errors
    SERVER: {
        INTERNAL_ERROR: 'An internal server error occurred',
        SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
        DATABASE_ERROR: 'Database operation failed',
        CONNECTION_ERROR: 'Connection error. Please try again',
        TIMEOUT: 'Request timeout. Please try again',
        NOT_FOUND: 'The requested resource was not found',
    },

    // General Errors
    GENERAL: {
        SOMETHING_WENT_WRONG: 'Something went wrong. Please try again',
        INVALID_REQUEST: 'Invalid request',
        MISSING_PARAMETERS: 'Missing required parameters',
        OPERATION_FAILED: 'Operation failed. Please try again',
    },
};

// Success Messages
const SUCCESS_MESSAGES = {
    AUTH: {
        LOGIN_SUCCESS: 'Login successful',
        LOGOUT_SUCCESS: 'Logged out successfully',
        REGISTRATION_SUCCESS: 'Registration successful',
        PASSWORD_CHANGED: 'Password changed successfully',
        PASSWORD_RESET_SENT: 'Password reset link sent to your email',
    },

    USER: {
        PROFILE_UPDATED: 'Profile updated successfully',
        ACCOUNT_DELETED: 'Account deleted successfully',
    },

    ENTRY: {
        CREATED: 'Entry saved successfully',
        UPDATED: 'Entry updated successfully',
        DELETED: 'Entry deleted successfully',
    },
};

module.exports = {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
};
