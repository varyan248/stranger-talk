const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "" },
    bio: { type: String, default: "" },
    interests: [String],
    language: { type: String, default: "en" },
    isAdmin: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false }, // For admin suspensions
    
    // 🔥 THIS WAS MISSING 🔥
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    showInDiscovery: { type: Boolean, default: true },
    online: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },

    settings: {
      showOnlineStatus: { type: Boolean, default: true },
      showInNearby: { type: Boolean, default: true },
      locationSharing: { type: Boolean, default: true },
      allowMessagesFrom: {
        type: String,
        enum: ["everyone", "nearby", "matches"],
        default: "everyone",
      },
    },
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);