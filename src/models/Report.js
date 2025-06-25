const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  type: { type: String, enum: ["post", "comment", "user"], required: true },
  reportedId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reason: { type: String, required: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "resolved", "ignored"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", reportSchema);
