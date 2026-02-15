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
console.log(process.env.MONGO_URI);

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/docTracker";

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Database Connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected", MONGO_URI))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Session Setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
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
    const { date, dayType, rows } = req.body;

    // rows is expected to be an array of objects
    // If it's a single object (one row), wrap it?
    // Better to handle parsing on client side to always send JSON array

    const newEntry = new Entry({
      user: req.session.userId,
      date,
      dayType,
      entries: rows, // Assuming rows structure matches schema
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

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
