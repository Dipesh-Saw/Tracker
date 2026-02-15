require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Configuration
const connectDatabase = require('./config/database');
const sessionConfig = require('./config/session');

// Middleware
const { attachUser } = require('./middleware/auth.middleware');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

// Routes
const userRoutes = require('./routes/user.routes');
const entryRoutes = require('./routes/entry.routes');
const productivityRoutes = require('./routes/productivity.routes');

// Models
const { Objects } = require('./models/MyObjects');
const entryService = require('./services/entry/EntryService');
const { isAuthenticated } = require('./middleware/auth.middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/docTracker';

// Connect to Database
connectDatabase();

// Middleware Setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Session Setup
app.use(sessionConfig(MONGO_URI));

// Attach user to views
app.use(attachUser);

// Routes
app.use(userRoutes);
app.use(entryRoutes);
app.use(productivityRoutes);

// Dashboard (Protected)
app.get('/', isAuthenticated, async (req, res) => {
  try {
    const entries = await entryService.getRecentEntries(req.session.userId, 5);
    res.render('index', { entries, Objects: Objects });
  } catch (err) {
    console.error(err);
    res.render('index', { entries: [], Objects: Objects });
  }
});

// Error Handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
