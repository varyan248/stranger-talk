const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, default: "" },
    type: {
      type: String,
      enum: ["text", "image", "voice"],
      default: "text",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Legacy alias — keeps old `text` field working if anything still uses it
    text: { type: String, default: "" },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);