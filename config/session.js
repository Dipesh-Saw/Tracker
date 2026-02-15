const session = require('express-session');
const MongoStore = require('connect-mongo');

/**
 * Session configuration
 * @param {String} mongoUri - MongoDB connection URI
 * @returns {Object} - Session middleware configuration
 */
const sessionConfig = (mongoUri) => {
    return session({
        secret: process.env.SESSION_SECRET || 'secret',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: mongoUri }),
        cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
    });
};

module.exports = sessionConfig;
