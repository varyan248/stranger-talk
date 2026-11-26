const User = require("../models/User");

// ==========================================
// PUT /api/users/location
// ==========================================
exports.updateLocation = async (req, res) => {
  try {
    const latitude = req.body.latitude ?? req.body.lat;
    const longitude = req.body.longitude ?? req.body.lng;

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates. Provide numeric latitude/longitude (or lat/lng).",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        location: { type: "Point", coordinates: [longitude, latitude] },
        lastSeen: new Date(),
      },
      { new: true, returnDocument: "after" }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error("updateLocation error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// GET /api/users/nearby?radius=5
// ==========================================
exports.nearby = async (req, res) => {
  try {
    const radiusKm = Number(req.query.radius || 5);
    const radiusMeters = radiusKm * 1000;
    const me = await User.findById(req.user._id);

    const coords = me?.location?.coordinates;
    if (
      !Array.isArray(coords) || coords.length !== 2 ||
      typeof coords[0] !== "number" || typeof coords[1] !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "Your location is not set. Please enable location access in your browser.",
      });
    }

    const myBlockedIds = (me.blockedUsers || []).map((id) => String(id));

    const users = await User.find({
      _id: { $ne: me._id, $nin: myBlockedIds },
      isBlocked: false,
      showInDiscovery: true,
      blockedUsers: { $ne: me._id },
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: coords },
          $maxDistance: radiusMeters,
        },
      },
    }).select("-password -email").limit(50);

    res.json({ success: true, users });
  } catch (err) {
    console.error("nearby error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// PUT /api/users/profile
// ==========================================
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ["name", "bio", "interests", "language", "profilePic", "showInDiscovery"];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true, returnDocument: "after",
    }).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// GET /api/users/settings
// ==========================================
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("settings");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, settings: user.settings });
  } catch (err) {
    console.error("getSettings error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// PUT /api/users/settings
// ==========================================
exports.updateSettings = async (req, res) => {
  try {
    const allowed = ["showOnlineStatus", "showInNearby", "locationSharing", "allowMessagesFrom"];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[`settings.${key}`] = req.body[key];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid settings provided to update" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id, { $set: updates }, { new: true, returnDocument: "after" }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, settings: user.settings, user });
  } catch (err) {
    console.error("updateSettings error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// GET /api/users/:userId
// ==========================================
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || userId.length !== 24) return res.status(400).json({ success: false, message: "Invalid user id" });

    const user = await User.findById(userId).select("-password -email -blockedUsers");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let distance;
    const me = await User.findById(req.user._id).select("location");
    const myCoords = me?.location?.coordinates;
    const theirCoords = user.location?.coordinates;

    if (
      Array.isArray(myCoords) && myCoords.length === 2 && typeof myCoords[0] === "number" && typeof myCoords[1] === "number" &&
      Array.isArray(theirCoords) && theirCoords.length === 2 && typeof theirCoords[0] === "number" && typeof theirCoords[1] === "number"
    ) {
      const [lon1, lat1] = myCoords;
      const [lon2, lat2] = theirCoords;
      const R = 6371;
      const toRad = (d) => (d * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    const payload = user.toObject();
    if (typeof distance === "number") payload.distance = distance;
    res.json({ success: true, user: payload });
  } catch (err) {
    console.error("getUserById error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// POST /api/users/avatar
// ==========================================
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    // 🔥 FIX: Changed req.user.id to req.user._id
    const user = await User.findByIdAndUpdate(
      req.user._id, 
      { profilePic: avatarUrl },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    res.status(200).json({ success: true, message: "Avatar updated", user });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ success: false, message: "Server error during upload" });
  }
};