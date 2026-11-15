// const Conversation = require("../models/Conversation");
// const Message = require("../models/Message");
// const User = require("../models/User");

// // ==========================================
// // POST /api/chat/conversations
// // Body: { userId }
// // Creates or returns an existing 1:1 conversation
// // ==========================================
// exports.createConversation = async (req, res) => {
//   try {
//     const myId = req.user._id;
//     const { userId } = req.body;

//     if (!userId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "userId is required" });
//     }

//     if (userId === String(myId)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Cannot start a chat with yourself" });
//     }

//     const other = await User.findById(userId);
//     if (!other) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     // Check if blocked
//     if (other.isBlocked) {
//       return res
//         .status(403)
//         .json({ success: false, message: "This user is not available" });
//     }

//     // Look for existing conversation between these two
//     let convo = await Conversation.findOne({
//       participants: { $all: [myId, userId], $size: 2 },
//       isRandom: { $ne: true },
//     })
//       .populate("participants", "name username profilePic online lastSeen")
//       .populate({
//         path: "lastMessage",
//         populate: { path: "sender", select: "name username profilePic" },
//       });

//     if (!convo) {
//       convo = await Conversation.create({
//         participants: [myId, userId],
//         unread: { [myId]: 0, [userId]: 0 },
//       });
//       convo = await Conversation.findById(convo._id)
//         .populate("participants", "name username profilePic online lastSeen")
//         .populate({
//           path: "lastMessage",
//           populate: { path: "sender", select: "name username profilePic" },
//         });
//     }

//     res.json({ success: true, conversation: convo });
//   } catch (err) {
//     console.error("createConversation error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ==========================================
// // GET /api/chat/conversations
// // Returns all conversations for the logged-in user
// // ==========================================
// exports.getConversations = async (req, res) => {
//   try {
//     const myId = req.user._id;

//     const convos = await Conversation.find({
//       participants: myId,
//       deletedBy: { $ne: myId },
//     })
//       .populate("participants", "name username profilePic online lastSeen")
//       .populate({
//         path: "lastMessage",
//         populate: { path: "sender", select: "name username profilePic" },
//       })
//       .sort({ updatedAt: -1 });

//     // Attach unread count for this user
//     const result = convos.map((c) => {
//       const obj = c.toObject();
//       const unreadMap = c.unread || new Map();
//       obj.unreadCount = unreadMap.get(String(myId)) || 0;
//       return obj;
//     });

//     res.json({ success: true, conversations: result });
//   } catch (err) {
//     console.error("getConversations error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ==========================================
// // GET /api/chat/conversations/:id
// // ==========================================
// exports.getConversation = async (req, res) => {
//   try {
//     const convo = await Conversation.findById(req.params.id)
//       .populate("participants", "name username profilePic online lastSeen")
//       .populate({
//         path: "lastMessage",
//         populate: { path: "sender", select: "name username profilePic" },
//       });

//     if (!convo) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Conversation not found" });
//     }

//     const isParticipant = convo.participants.some(
//       (p) => String(p._id) === String(req.user._id)
//     );
//     if (!isParticipant) {
//       return res
//         .status(403)
//         .json({ success: false, message: "Not a participant" });
//     }

//     res.json({ success: true, conversation: convo });
//   } catch (err) {
//     console.error("getConversation error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ==========================================
// // DELETE /api/chat/conversations/:id
// // Soft delete for the current user only
// // ==========================================
// exports.deleteConversation = async (req, res) => {
//   try {
//     const myId = req.user._id;

//     const convo = await Conversation.findById(req.params.id);
//     if (!convo) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Conversation not found" });
//     }

//     const isParticipant = convo.participants.some(
//       (p) => String(p) === String(myId)
//     );
//     if (!isParticipant) {
//       return res
//         .status(403)
//         .json({ success: false, message: "Not a participant" });
//     }

//     if (!convo.deletedBy.some((u) => String(u) === String(myId))) {
//       convo.deletedBy.push(myId);
//       await convo.save();
//     }

//     res.json({ success: true, message: "Conversation deleted" });
//   } catch (err) {
//     console.error("deleteConversation error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ==========================================
// // GET /api/chat/conversations/:id/messages?page=1&limit=50
// // ==========================================
// exports.getMessages = async (req, res) => {
//   try {
//     const myId = req.user._id;
//     const { id } = req.params;
//     const page = Math.max(1, parseInt(req.query.page) || 1);
//     const limit = Math.min(100, parseInt(req.query.limit) || 50);
//     const skip = (page - 1) * limit;

//     const convo = await Conversation.findById(id);
//     if (!convo) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Conversation not found" });
//     }
//     const isParticipant = convo.participants.some(
//       (p) => String(p) === String(myId)
//     );
//     if (!isParticipant) {
//       return res
//         .status(403)
//         .json({ success: false, message: "Not a participant" });
//     }

//     const total = await Message.countDocuments({ conversationId: id });
//     const messages = await Message.find({ conversationId: id })
//       .populate("sender", "name username profilePic")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     // Return oldest-first to match chat UI
//     messages.reverse();

//     res.json({
//       success: true,
//       messages,
//       page,
//       totalPages: Math.ceil(total / limit) || 1,
//       hasMore: skip + messages.length < total,
//     });
//   } catch (err) {
//     console.error("getMessages error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ==========================================
// // POST /api/chat/conversations/:id/messages
// // Body: { content, type }
// // ==========================================
// exports.sendMessage = async (req, res) => {
//   try {
//     const myId = req.user._id;
//     const { id } = req.params;
//     const { content, type = "text" } = req.body;

//     if (!content || !content.trim()) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Message content is required" });
//     }

//     const convo = await Conversation.findById(id);
//     if (!convo) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Conversation not found" });
//     }
//     const isParticipant = convo.participants.some(
//       (p) => String(p) === String(myId)
//     );
//     if (!isParticipant) {
//       return res
//         .status(403)
//         .json({ success: false, message: "Not a participant" });
//     }

//     const message = await Message.create({
//       conversationId: id,
//       sender: myId,
//       content: content.trim(),
//       text: content.trim(), // legacy field
//       type,
//       status: "sent",
//       readBy: [myId],
//     });

//     const populated = await message.populate(
//       "sender",
//       "name username profilePic"
//     );

//     // Update conversation's last message
//     convo.lastMessage = message._id;

//     // Increment unread for all other participants
//     if (!convo.unread) convo.unread = new Map();
//     convo.participants.forEach((p) => {
//       if (String(p) !== String(myId)) {
//         const current = convo.unread.get(String(p)) || 0;
//         convo.unread.set(String(p), current + 1);
//       }
//     });

//     // If I had previously deleted this convo from my list, restore it
//     convo.deletedBy = convo.deletedBy.filter(
//       (u) => String(u) !== String(myId)
//     );

//     await convo.save();

//     // Emit via socket for real-time delivery
//     const io = req.app.get("io");
//     if (io) {
//       io.to(String(id)).emit("new-message", {
//         conversationId: String(id),
//         message: populated,
//       });
//     }

//     res.status(201).json({ success: true, message: populated });
//   } catch (err) {
//     console.error("sendMessage error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ==========================================
// // PUT /api/chat/conversations/:id/read
// // ==========================================
// exports.markAsRead = async (req, res) => {
//   try {
//     const myId = req.user._id;
//     const { id } = req.params;

//     const convo = await Conversation.findById(id);
//     if (!convo) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Conversation not found" });
//     }

//     if (!convo.unread) convo.unread = new Map();
//     convo.unread.set(String(myId), 0);
//     await convo.save();

//     await Message.updateMany(
//       {
//         conversationId: id,
//         sender: { $ne: myId },
//         readBy: { $ne: myId },
//       },
//       {
//         $addToSet: { readBy: myId },
//         $set: { status: "read" },
//       }
//     );

//     const io = req.app.get("io");
//     if (io) {
//       io.to(String(id)).emit("message-read", {
//         conversationId: String(id),
//         userId: String(myId),
//       });
//     }

//     res.json({ success: true });
//   } catch (err) {
//     console.error("markAsRead error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ==========================================
// // POST /api/chat/random
// // Find or create a random anonymous chat
// // ==========================================
// exports.findRandomStranger = async (req, res) => {
//   try {
//     const myId = req.user._id;

//     // Look for any waiting random conversation
//     let convo = await Conversation.findOne({
//       isRandom: true,
//       participants: { $size: 1 },
//       participants: { $ne: myId },
//     });

//     if (convo && !convo.participants.some((p) => String(p) === String(myId))) {
//       // Join existing
//       convo.participants.push(myId);
//       if (!convo.unread) convo.unread = new Map();
//       convo.unread.set(String(myId), 0);
//       convo.unread.set(String(convo.participants[0]), 0);
//       await convo.save();
//     } else {
//       // Create a new waiting conversation
//       convo = await Conversation.create({
//         participants: [myId],
//         isRandom: true,
//         anonymous: true,
//         unread: { [myId]: 0 },
//       });
//     }

//     const populated = await Conversation.findById(convo._id)
//       .populate("participants", "name username profilePic online lastSeen")
//       .populate({
//         path: "lastMessage",
//         populate: { path: "sender", select: "name username profilePic" },
//       });

//     res.json({ success: true, conversation: populated });
//   } catch (err) {
//     console.error("findRandomStranger error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ==========================================
// // POST /api/chat/random/:id/end
// // ==========================================
// exports.endRandomChat = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const convo = await Conversation.findById(id);
//     if (!convo) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Conversation not found" });
//     }

//     const io = req.app.get("io");
//     if (io) {
//       io.to(String(id)).emit("stranger-disconnected", {
//         conversationId: String(id),
//       });
//     }

//     res.json({ success: true });
//   } catch (err) {
//     console.error("endRandomChat error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ==========================================
// // POST /api/chat/block/:userId
// // ==========================================
// exports.blockUser = async (req, res) => {
//   try {
//     const myId = req.user._id;
//     const { userId } = req.params;

//     await User.findByIdAndUpdate(myId, {
//       $addToSet: { blockedUsers: userId },
//     });

//     res.json({ success: true, message: "User blocked" });
//   } catch (err) {
//     console.error("blockUser error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ==========================================
// // DELETE /api/chat/block/:userId
// // ==========================================
// exports.unblockUser = async (req, res) => {
//   try {
//     const myId = req.user._id;
//     const { userId } = req.params;

//     await User.findByIdAndUpdate(myId, {
//       $pull: { blockedUsers: userId },
//     });

//     res.json({ success: true, message: "User unblocked" });
//   } catch (err) {
//     console.error("unblockUser error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ==========================================
// // GET /api/chat/blocked
// // ==========================================
// exports.getBlockedUsers = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).populate(
//       "blockedUsers",
//       "name username profilePic"
//     );
//     res.json({ success: true, users: user.blockedUsers || [] });
//   } catch (err) {
//     console.error("getBlockedUsers error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ==========================================
// // POST /api/chat/report/:userId
// // Body: { reason, description }
// // ==========================================
// exports.reportUser = async (req, res) => {
//   try {
//     const Report = require("../models/Report");
//     const { userId } = req.params;
//     const { reason, description } = req.body;

//     if (!reason) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Reason is required" });
//     }

//     const report = await Report.create({
//       reporter: req.user._id,
//       reported: userId,
//       reason,
//       description: description || "",
//     });

//     res.status(201).json({ success: true, report });
//   } catch (err) {
//     console.error("reportUser error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const { getBlockStatus } = require("../utils/blockCheck");

// ==========================================
// POST /api/chat/conversations
// Body: { userId }
// ==========================================
exports.createConversation = async (req, res) => {
  try {
    const myId = req.user._id;
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId is required" });
    }

    if (userId === String(myId)) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot start a chat with yourself" });
    }

    const other = await User.findById(userId);
    if (!other) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Admin-suspended user
    if (other.isBlocked) {
      return res
        .status(403)
        .json({ success: false, message: "This user is not available" });
    }

    // NEW: user-to-user block check
    const { eitherBlocked } = await getBlockStatus(myId, userId);
    if (eitherBlocked) {
      return res.status(403).json({
        success: false,
        message: "Cannot start a conversation with this user.",
      });
    }

    let convo = await Conversation.findOne({
      participants: { $all: [myId, userId], $size: 2 },
      isRandom: { $ne: true },
    })
      .populate("participants", "name username profilePic online lastSeen")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name username profilePic" },
      });

    if (!convo) {
      convo = await Conversation.create({
        participants: [myId, userId],
        unread: { [myId]: 0, [userId]: 0 },
      });
      convo = await Conversation.findById(convo._id)
        .populate("participants", "name username profilePic online lastSeen")
        .populate({
          path: "lastMessage",
          populate: { path: "sender", select: "name username profilePic" },
        });
    }

    res.json({ success: true, conversation: convo });
  } catch (err) {
    console.error("createConversation error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// GET /api/chat/conversations
// ==========================================
exports.getConversations = async (req, res) => {
  try {
    const myId = req.user._id;

    const convos = await Conversation.find({
      participants: myId,
      deletedBy: { $ne: myId },
    })
      .populate("participants", "name username profilePic online lastSeen")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name username profilePic" },
      })
      .sort({ updatedAt: -1 });

    const result = convos.map((c) => {
      const obj = c.toObject();
      const unreadMap = c.unread || new Map();
      obj.unreadCount = unreadMap.get(String(myId)) || 0;
      return obj;
    });

    res.json({ success: true, conversations: result });
  } catch (err) {
    console.error("getConversations error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// GET /api/chat/conversations/:id
// ==========================================
exports.getConversation = async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.id)
      .populate("participants", "name username profilePic online lastSeen")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name username profilePic" },
      });

    if (!convo) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    const isParticipant = convo.participants.some(
      (p) => String(p._id) === String(req.user._id)
    );
    if (!isParticipant) {
      return res
        .status(403)
        .json({ success: false, message: "Not a participant" });
    }

    res.json({ success: true, conversation: convo });
  } catch (err) {
    console.error("getConversation error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// DELETE /api/chat/conversations/:id
// ==========================================
exports.deleteConversation = async (req, res) => {
  try {
    const myId = req.user._id;

    const convo = await Conversation.findById(req.params.id);
    if (!convo) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    const isParticipant = convo.participants.some(
      (p) => String(p) === String(myId)
    );
    if (!isParticipant) {
      return res
        .status(403)
        .json({ success: false, message: "Not a participant" });
    }

    if (!convo.deletedBy.some((u) => String(u) === String(myId))) {
      convo.deletedBy.push(myId);
      await convo.save();
    }

    res.json({ success: true, message: "Conversation deleted" });
  } catch (err) {
    console.error("deleteConversation error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// GET /api/chat/conversations/:id/messages
// ==========================================
exports.getMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip = (page - 1) * limit;

    const convo = await Conversation.findById(id);
    if (!convo) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }
    const isParticipant = convo.participants.some(
      (p) => String(p) === String(myId)
    );
    if (!isParticipant) {
      return res
        .status(403)
        .json({ success: false, message: "Not a participant" });
    }

    const total = await Message.countDocuments({ conversationId: id });
    const messages = await Message.find({ conversationId: id })
      .populate("sender", "name username profilePic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    messages.reverse();

    res.json({
      success: true,
      messages,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      hasMore: skip + messages.length < total,
    });
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// POST /api/chat/conversations/:id/messages
// ==========================================
exports.sendMessage = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id } = req.params;
    const { content, type = "text" } = req.body;

    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message content is required" });
    }

    const convo = await Conversation.findById(id);
    if (!convo) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }
    const isParticipant = convo.participants.some(
      (p) => String(p) === String(myId)
    );
    if (!isParticipant) {
      return res
        .status(403)
        .json({ success: false, message: "Not a participant" });
    }

    // ---- NEW: enforce user-to-user blocks ----
    const otherId = convo.participants.find(
      (p) => String(p) !== String(myId)
    );
    if (otherId) {
      const { iBlockedThem, theyBlockedMe } = await getBlockStatus(
        myId,
        otherId
      );

      if (iBlockedThem) {
        return res.status(403).json({
          success: false,
          message:
            "You have blocked this user. Unblock them to send messages.",
        });
      }

      if (theyBlockedMe) {
        return res.status(403).json({
          success: false,
          message: "You cannot send messages to this user.",
        });
      }
    }

    const message = await Message.create({
      conversationId: id,
      sender: myId,
      content: content.trim(),
      text: content.trim(),
      type,
      status: "sent",
      readBy: [myId],
    });

    const populated = await message.populate(
      "sender",
      "name username profilePic"
    );

    convo.lastMessage = message._id;

    if (!convo.unread) convo.unread = new Map();
    convo.participants.forEach((p) => {
      if (String(p) !== String(myId)) {
        const current = convo.unread.get(String(p)) || 0;
        convo.unread.set(String(p), current + 1);
      }
    });

    convo.deletedBy = convo.deletedBy.filter(
      (u) => String(u) !== String(myId)
    );

    await convo.save();

    const io = req.app.get("io");
    if (io) {
      io.to(String(id)).emit("new-message", {
        conversationId: String(id),
        message: populated,
      });
    }

    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// PUT /api/chat/conversations/:id/read
// ==========================================
exports.markAsRead = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id } = req.params;

    const convo = await Conversation.findById(id);
    if (!convo) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    if (!convo.unread) convo.unread = new Map();
    convo.unread.set(String(myId), 0);
    await convo.save();

    await Message.updateMany(
      { conversationId: id, sender: { $ne: myId }, readBy: { $ne: myId } },
      { $addToSet: { readBy: myId }, $set: { status: "read" } }
    );

    const io = req.app.get("io");
    if (io) {
      io.to(String(id)).emit("message-read", {
        conversationId: String(id),
        userId: String(myId),
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("markAsRead error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// POST /api/chat/random
// ==========================================
exports.findRandomStranger = async (req, res) => {
  try {
    const myId = req.user._id;

    let convo = await Conversation.findOne({
      isRandom: true,
      participants: { $size: 1 },
      participants: { $ne: myId },
    });

    if (convo && !convo.participants.some((p) => String(p) === String(myId))) {
      convo.participants.push(myId);
      if (!convo.unread) convo.unread = new Map();
      convo.unread.set(String(myId), 0);
      convo.unread.set(String(convo.participants[0]), 0);
      await convo.save();
    } else {
      convo = await Conversation.create({
        participants: [myId],
        isRandom: true,
        anonymous: true,
        unread: { [myId]: 0 },
      });
    }

    const populated = await Conversation.findById(convo._id)
      .populate("participants", "name username profilePic online lastSeen")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name username profilePic" },
      });

    res.json({ success: true, conversation: populated });
  } catch (err) {
    console.error("findRandomStranger error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// POST /api/chat/random/:id/end
// ==========================================
exports.endRandomChat = async (req, res) => {
  try {
    const { id } = req.params;
    const convo = await Conversation.findById(id);
    if (!convo) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    const io = req.app.get("io");
    if (io) {
      io.to(String(id)).emit("stranger-disconnected", {
        conversationId: String(id),
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("endRandomChat error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// POST /api/chat/block/:userId
// ==========================================
exports.blockUser = async (req, res) => {
  try {
    const myId = req.user._id;
    const { userId } = req.params;

    if (String(userId) === String(myId)) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot block yourself" });
    }

    await User.findByIdAndUpdate(myId, {
      $addToSet: { blockedUsers: userId },
    });

    // NEW: hide any existing conversation between them from the blocker's list
    await Conversation.updateMany(
      { participants: { $all: [myId, userId], $size: 2 } },
      { $addToSet: { deletedBy: myId } }
    );

    res.json({ success: true, message: "User blocked" });
  } catch (err) {
    console.error("blockUser error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// DELETE /api/chat/block/:userId
// ==========================================
exports.unblockUser = async (req, res) => {
  try {
    const myId = req.user._id;
    const { userId } = req.params;

    // 1. Remove from blockedUsers list
    await User.findByIdAndUpdate(myId, {
      $pull: { blockedUsers: userId },
    });

    // 🔥 NEW: Un-hide the conversation so it reappears in the sidebar
    await Conversation.updateMany(
      { participants: { $all: [myId, userId], $size: 2 } },
      { $pull: { deletedBy: myId } }
    );

    res.json({ success: true, message: "User unblocked" });
  } catch (err) {
    console.error("unblockUser error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// GET /api/chat/blocked
// ==========================================
exports.getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "blockedUsers",
      "name username profilePic"
    );
    res.json({ success: true, users: user.blockedUsers || [] });
  } catch (err) {
    console.error("getBlockedUsers error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// POST /api/chat/report/:userId
// ==========================================
exports.reportUser = async (req, res) => {
  try {
    const Report = require("../models/Report");
    const { userId } = req.params;
    const { reason, description } = req.body;

    if (!reason) {
      return res
        .status(400)
        .json({ success: false, message: "Reason is required" });
    }

    const report = await Report.create({
      reporter: req.user._id,
      reported: userId,
      reason,
      description: description || "",
    });

    res.status(201).json({ success: true, report });
  } catch (err) {
    console.error("reportUser error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};