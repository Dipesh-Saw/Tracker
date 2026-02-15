const mongoose = require('mongoose');

/**
 * Database connection configuration
 * Handles MongoDB connection with error handling and retry logic
 */
const connectDatabase = async () => {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/docTracker';

    try {
        await mongoose.connect(MONGO_URI);
        if (MONGO_URI == "mongodb://localhost:27017/docTracker") {
            console.log('Local MongoDB Connected');
        }
        else {
            console.log('Cloud MongoDB Connected');
        }

    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectDatabase, 5000);
    }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
});

module.exports = connectDatabase;
