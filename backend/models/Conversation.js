const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    anonymous: { type: Boolean, default: false },
    isRandom: { type: Boolean, default: false },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    // Per-participant unread counts and read state
    unread: {
      type: Map,
      of: Number,
      default: {},
    },
    deletedBy: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);