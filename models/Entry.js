const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  date: { type: Date, required: true },
  dayType: {
    type: String,
    enum: ["Half Day", "Full Day", "PTO"],
    required: true,
  },
  entries: [
    {
      platform: String,
      docType: String,
      queue: String,
      count: Number,
      timeInMins: Number,
    },
  ],
  nonProductiveEntries: [
    {
      activityType: String,
      duration: Number,
      comments: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Entry", entrySchema);
