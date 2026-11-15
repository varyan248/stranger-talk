const mongoose = require("mongoose");
const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reported: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reason: String,
    status: { type: String, default: "pending" },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Report", reportSchema);
