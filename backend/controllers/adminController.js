const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Report = require("../models/Report");

// ==========================================
// GET /api/admin/stats
// Dashboard summary numbers
// ==========================================
exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      onlineUsers,
      suspendedAccounts,
      totalConversations,
      totalMessages,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ online: true }),
      User.countDocuments({ isBlocked: true }),
      Conversation.countDocuments({}),
      Message.countDocuments({}),
      Report.countDocuments({ status: "pending" }),
    ]);

    // Daily active users (unique senders in the last 24h)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dailyActive = await Message.distinct("sender", {
      createdAt: { $gte: since },
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        onlineUsers,
        suspendedAccounts,
        totalConversations,
        totalMessages,
        pendingReports,
        dailyActiveUsers: dailyActive.length,
      },
    });
  } catch (err) {
    console.error("getStats error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// GET /api/admin/analytics?period=7d
// Time-series data for charts
// ==========================================
exports.getAnalytics = async (req, res) => {
  try {
    const period = req.query.period || "7d";
    const days =
      period === "24h" ? 1 : period === "30d" ? 30 : period === "90d" ? 90 : 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // User growth — registrations per day
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", count: 1 } },
    ]);

    // New conversations per day
    const conversations = await Conversation.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", count: 1 } },
    ]);

    // Messages per day
    const messages = await Message.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", count: 1 } },
    ]);

    // Daily activity — unique senders per day
    const dailyActivity = await Message.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            sender: "$sender",
          },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", count: 1 } },
    ]);

    // Report distribution
    const [pending, resolved, dismissed] = await Promise.all([
      Report.countDocuments({ status: "pending" }),
      Report.countDocuments({ status: "resolved" }),
      Report.countDocuments({ status: "dismissed" }),
    ]);

    res.json({
      success: true,
      analytics: {
        userGrowth,
        conversations,
        messages,
        dailyActivity,
        reports: { pending, resolved, dismissed },
        summary: {
          newUsers: userGrowth.reduce((a, b) => a + b.count, 0),
          newConversations: conversations.reduce((a, b) => a + b.count, 0),
          messagesSent: messages.reduce((a, b) => a + b.count, 0),
          reportsFiled: pending + resolved + dismissed,
        },
      },
    });
  } catch (err) {
    console.error("getAnalytics error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// GET /api/admin/users?page=1&limit=10&search=&isSuspended=
// ==========================================
exports.getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim() || "";
    const isSuspended =
      req.query.isSuspended === "true"
        ? true
        : req.query.isSuspended === "false"
        ? false
        : undefined;

    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (isSuspended !== undefined) filter.isBlocked = isSuspended;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error("getUsers error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// GET /api/admin/users/:id
// ==========================================
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("getUser error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// PUT /api/admin/users/:id/suspend
// ==========================================
exports.suspendUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isBlocked: true,
        suspensionReason: reason || "Violation of community guidelines",
        suspendedAt: new Date(),
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("suspendUser error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// PUT /api/admin/users/:id/unsuspend
// ==========================================
exports.unsuspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false, suspensionReason: "", suspendedAt: null },
      { new: true }
    ).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("unsuspendUser error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// POST /api/admin/users/:id/warn
// ==========================================
exports.warnUser = async (req, res) => {
  try {
    const { message } = req.body;
    // Placeholder — if you add a Warning model later, save here
    console.log(`Warning sent to ${req.params.id}: ${message}`);
    res.json({ success: true, message: "Warning sent" });
  } catch (err) {
    console.error("warnUser error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// GET /api/admin/reports?page=1&status=pending
// ==========================================
exports.getReports = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = {};
    if (status && status !== "all") filter.status = status;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate("reporter", "name username profilePic")
        .populate("reported", "name username profilePic isBlocked")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Report.countDocuments(filter),
    ]);

    res.json({
      success: true,
      reports,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error("getReports error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// GET /api/admin/reports/:id
// ==========================================
exports.getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("reporter", "name username profilePic")
      .populate("reported", "name username profilePic isBlocked");

    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }
    res.json({ success: true, report });
  } catch (err) {
    console.error("getReport error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// PUT /api/admin/reports/:id
// Body: { status, adminNote }
// ==========================================
exports.updateReportStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!["pending", "resolved", "dismissed"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, adminNote: adminNote || "" },
      { new: true }
    );
    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }
    res.json({ success: true, report });
  } catch (err) {
    console.error("updateReportStatus error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// GET /api/admin/settings
// PUT /api/admin/settings
// Placeholder — returns the same defaults used on frontend
// ==========================================
exports.getSettings = async (req, res) => {
  res.json({
    success: true,
    settings: {
      maintenanceMode: false,
      registrationEnabled: true,
      allowGuestAccess: false,
      profanityFilter: true,
      maxMessageLength: 1000,
      chatRetentionDays: 30,
      maxRadius: 10,
      autoSuspendThreshold: 3,
      requireEmailVerification: false,
    },
  });
};

exports.updateSettings = async (req, res) => {
  // If you want persistence, add an AdminSettings model later
  res.json({ success: true, settings: req.body });
};