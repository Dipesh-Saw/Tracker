require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Entry = require("./models/Entry");
const { Objects } = require("./models/MyObjects");
const { log } = require("console");

const app = express();
const PORT = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/docTracker";

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Database Connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    if (process.env.MONGO_URI) {
      console.log("Cloud database is connected");
    } else {
      console.log("Local MongoDB connected");
    }
  })
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Session Setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// Auth Middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.redirect("/auth/login");
};

const isGuest = (req, res, next) => {
  if (!req.session.userId) {
    return next();
  }
  res.redirect("/");
};

// Make user available in views
app.use(async (req, res, next) => {
  if (req.session.userId) {
    res.locals.user = await User.findById(req.session.userId);
  } else {
    res.locals.user = null;
  }
  next();
});

// --- ROUTES ---

// Dashboard (Protected)
app.get("/", isAuthenticated, async (req, res) => {
  try {
    // Fetch recent entries for the user to display if needed, or just render the form
    const entries = await Entry.find({ user: req.session.userId })
      .sort({ date: -1 })
      .limit(5);
    res.render("index", { entries, Objects: Objects });
  } catch (err) {
    console.error(err);
    res.render("index", { entries: [], Objects: Objects });
  }
});

// Create Entry
app.post("/api/entry", isAuthenticated, async (req, res) => {
  try {
    const { date, dayType, rows, username } = req.body;
    const user = res.locals.user; // Get user from locals populated by middleware

    // If not admin, force username to be the logged-in user's username
    const entryUsername = (user.isAdmin && username) ? username : user.username;

    const newEntry = new Entry({
      user: req.session.userId,
      username: entryUsername,
      date,
      dayType,
      entries: rows,
    });

    await newEntry.save();
    res.json({ success: true, message: "Saved successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -- Auth Routes --

app.get("/auth/login", isGuest, (req, res) => {
  res.render("login", { error: null });
});

app.post("/auth/login", isGuest, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render("login", { error: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", { error: "Invalid email or password" });
    }
    req.session.userId = user._id;
    res.redirect("/");
  } catch (err) {
    res.render("login", { error: "An error occurred" });
  }
});

app.get("/auth/register", isGuest, (req, res) => {
  res.render("register", { error: null });
});

app.post("/auth/register", isGuest, async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("register", { error: "Email already in use" });
    }
    const user = new User({ username, email, password });
    await user.save();
    req.session.userId = user._id;
    res.redirect("/");
  } catch (err) {
    res.render("register", { error: "Registration failed: " + err.message });
  }
});

app.get("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
});

app.get("/auth/forgot-password", isGuest, (req, res) => {
  res.render("forgot-password", { message: null, error: null });
});

app.post("/auth/forgot-password", isGuest, (req, res) => {
  res.render("forgot-password", { message: "This function is not working now, please reach out to your POC", error: null });
});

const exceljs = require("exceljs");

// ... (existing imports)

// Export to Excel
app.get("/api/export-excel", isAuthenticated, async (req, res) => {
  try {
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet("Entries");

    worksheet.columns = [
      { header: "Username", key: "username", width: 20 },
      { header: "Date", key: "date", width: 15 },
      { header: "Day Type", key: "dayType", width: 15 },
      { header: "Platform", key: "platform", width: 15 },
      { header: "Queue", key: "queue", width: 15 },
      { header: "Document Type", key: "docType", width: 20 },
      { header: "Count", key: "count", width: 10 },
      { header: "Time (mins)", key: "timeInMins", width: 15 },
    ];

    let entries;
    if (res.locals.user && res.locals.user.isAdmin) {
      entries = await Entry.find({}).sort({ date: -1 });
    } else {
      entries = await Entry.find({ user: req.session.userId }).sort({ date: -1 });
    }

    entries.forEach((entry) => {
      const entryDate = new Date(entry.date).toLocaleDateString();
      entry.entries.forEach((row) => {
        worksheet.addRow({
          username: entry.username, // Using the stored username
          date: entryDate,
          dayType: entry.dayType,
          platform: row.platform,
          queue: row.queue,
          docType: row.docType,
          count: row.count,
          timeInMins: row.timeInMins,
        });
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "DailyTrackerData.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Export Error:", err);
    res.status(500).send("Error exporting data");
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
