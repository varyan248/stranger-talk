const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Map userId -> Set of socketIds (a user can have multiple tabs open)
const onlineUsers = new Map();

module.exports = (io) => {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        socket.userId = null;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      socket.userId = null;
      next();
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id, "user:", socket.userId);

    // ==========================================
    // Presence: mark user online
    // ==========================================
    if (socket.userId) {
      const uid = String(socket.userId);

      // Track all sockets for this user
      if (!onlineUsers.has(uid)) onlineUsers.set(uid, new Set());
      onlineUsers.get(uid).add(socket.id);

      // Mark user online in DB
      User.findByIdAndUpdate(socket.userId, {
        online: true,
        lastSeen: new Date(),
      })
        .then(async () => {
          const ids = Array.from(onlineUsers.keys());
          const users = await User.find({ _id: { $in: ids } }).select(
            "name username profilePic online"
          );

          // Send full list to the newly connected socket
          socket.emit("online-users", users);

          // Fetch this user's full object and broadcast to others
          const me = await User.findById(socket.userId).select(
            "name username profilePic online"
          );

          if (me) {
            socket.broadcast.emit("user-online", {
              _id: String(me._id),
              name: me.name,
              username: me.username,
              profilePic: me.profilePic,
              online: true,
            });
          }
        })
        .catch((err) => console.error("presence online error:", err));
    }

    // ==========================================
    // Client → Server events
    // ==========================================

    socket.on("join-room", (conversationId) => {
      if (conversationId) {
        socket.join(String(conversationId));
        console.log(`Socket ${socket.id} joined room ${conversationId}`);
      }
    });

    socket.on("leave-room", (conversationId) => {
      if (conversationId) {
        socket.leave(String(conversationId));
        console.log(`Socket ${socket.id} left room ${conversationId}`);
      }
    });

    // Explicit presence query
    socket.on("get-online-users", () => {
      const ids = Array.from(onlineUsers.keys());
      User.find({ _id: { $in: ids } })
        .select("name username profilePic online")
        .then((users) => socket.emit("online-users", users))
        .catch((err) => console.error("get-online-users error:", err));
    });

    // Typing indicator
    socket.on("typing", ({ conversationId, isTyping }) => {
      if (!conversationId || !socket.userId) return;
      socket.to(String(conversationId)).emit("user-typing", {
        conversationId: String(conversationId),
        userId: String(socket.userId),
        isTyping: !!isTyping,
      });
    });

    // ==========================================
    // Send message via socket (with block check)
    // ==========================================
    socket.on("send-message", async ({ conversationId, content, type = "text" }) => {
      try {
        if (!socket.userId || !conversationId || !content?.trim()) return;

        const convo = await Conversation.findById(conversationId);
        if (!convo) return;

        // Enforce user-to-user blocks
        const otherId = convo.participants.find(
          (p) => String(p) !== String(socket.userId)
        );

        if (otherId) {
          const [me, other] = await Promise.all([
            User.findById(socket.userId).select("blockedUsers"),
            User.findById(otherId).select("blockedUsers"),
          ]);

          const iBlockedThem = !!me?.blockedUsers?.some(
            (id) => String(id) === String(otherId)
          );
          const theyBlockedMe = !!other?.blockedUsers?.some(
            (id) => String(id) === String(socket.userId)
          );

          if (iBlockedThem || theyBlockedMe) {
            socket.emit("message-error", {
              conversationId: String(conversationId),
              message: iBlockedThem
                ? "You have blocked this user."
                : "You cannot send messages to this user.",
            });
            return;
          }
        }

        const message = await Message.create({
          conversationId,
          sender: socket.userId,
          content: content.trim(),
          text: content.trim(),
          type,
          status: "sent",
          readBy: [socket.userId],
        });

        const populated = await message.populate(
          "sender",
          "name username profilePic"
        );

        // Update conversation lastMessage + unread counts
        convo.lastMessage = message._id;
        if (!convo.unread) convo.unread = new Map();
        convo.participants.forEach((p) => {
          if (String(p) !== String(socket.userId)) {
            const cur = convo.unread.get(String(p)) || 0;
            convo.unread.set(String(p), cur + 1);
          }
        });
        await convo.save();

        io.to(String(conversationId)).emit("new-message", {
          conversationId: String(conversationId),
          message: populated,
        });
      } catch (err) {
        console.error("socket send-message error:", err);
      }
    });

    // ==========================================
    // Disconnect: mark user offline
    // ==========================================
    socket.on("disconnect", async () => {
      console.log("Socket disconnected:", socket.id);
      if (!socket.userId) return;

      const uid = String(socket.userId);
      const sockets = onlineUsers.get(uid);

      if (sockets) {
        sockets.delete(socket.id);

        // User still has other tabs open — stay online
        if (sockets.size > 0) return;

        onlineUsers.delete(uid);
      }

      try {
        await User.findByIdAndUpdate(socket.userId, {
          online: false,
          lastSeen: new Date(),
        });
      } catch (err) {
        console.error("presence offline error:", err);
      }

      io.emit("user-offline", uid);
    });
  });
};