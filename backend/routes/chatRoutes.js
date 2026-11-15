const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  createConversation,
  getConversations,
  getConversation,
  deleteConversation,
  getMessages,
  sendMessage,
  markAsRead,
  findRandomStranger,
  endRandomChat,
  blockUser,
  unblockUser,
  getBlockedUsers,
  reportUser,
} = require("../controllers/chatController");

// Conversations
router.post("/conversations", auth, createConversation);
router.get("/conversations", auth, getConversations);
router.get("/conversations/:id", auth, getConversation);
router.delete("/conversations/:id", auth, deleteConversation);

// Messages
router.get("/conversations/:id/messages", auth, getMessages);
router.post("/conversations/:id/messages", auth, sendMessage);
router.put("/conversations/:id/read", auth, markAsRead);
router.delete("/messages/:messageId", auth, (req, res) =>
  res.json({ success: true })
); // stub for now

// Random chat
router.post("/random", auth, findRandomStranger);
router.post("/random/:id/end", auth, endRandomChat);

// Block
router.post("/block/:userId", auth, blockUser);
router.delete("/block/:userId", auth, unblockUser);
router.get("/blocked", auth, getBlockedUsers);

// Report
router.post("/report/:userId", auth, reportUser);

module.exports = router;