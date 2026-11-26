const User = require("../models/User");

// ==========================================
// PUT /api/users/location
// Accepts { latitude, longitude } OR { lat, lng }
// ==========================================
exports.updateLocation = async (req, res) => {
  try {
    // Accept both naming conventions
    const latitude = req.body.latitude ?? req.body.lat;
    const longitude = req.body.longitude ?? req.body.lng;

    // Validate: must be finite numbers
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid coordinates. Provide numeric latitude/longitude (or lat/lng).",
      });
    }

    // GeoJSON stores [longitude, latitude]
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        lastSeen: new Date(),
      },
      { new: true, returnDocument: "after" }
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("updateLocation error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// GET /api/users/nearby?radius=5
// Radius in KM. Converts to meters for MongoDB.
// ==========================================
exports.nearby = async (req, res) => {
  try {
    const radiusKm = Number(req.query.radius || 5);
    const radiusMeters = radiusKm * 1000;

    const me = await User.findById(req.user._id);

    // Verify my own location is set and valid
    const coords = me?.location?.coordinates;
    if (
      !Array.isArray(coords) ||
      coords.length !== 2 ||
      typeof coords[0] !== "number" ||
      typeof coords[1] !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Your location is not set. Please enable location access in your browser.",
      });
    }

    const users = await User.find({
      _id: { $ne: me._id },
      isBlocked: false,
      showInDiscovery: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: coords },
          $maxDistance: radiusMeters,
        },
      },
    })
      .select("-password -email")
      .limit(50);

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
    const allowed = [
      "name",
      "bio",
      "interests",
      "language",
      "profilePic",
      "showInDiscovery",
    ];

    const updates = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      returnDocument: "after",
    }).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

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
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, settings: user.settings });
  } catch (err) {
    console.error("getSettings error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// PUT /api/users/settings
// Body: { showOnlineStatus, showInNearby, locationSharing, allowMessagesFrom }
// ==========================================
exports.updateSettings = async (req, res) => {
  try {
    const allowed = [
      "showOnlineStatus",
      "showInNearby",
      "locationSharing",
      "allowMessagesFrom",
    ];

    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        updates[`settings.${key}`] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid settings provided to update",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, returnDocument: "after" }
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, settings: user.settings, user });
  } catch (err) {
    console.error("updateSettings error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// GET /api/users/:userId
// Public profile lookup — excludes sensitive fields
// ==========================================
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Basic ObjectId sanity check
    if (!userId || userId.length !== 24) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user id" });
    }

    const user = await User.findById(userId).select(
      "-password -email -blockedUsers"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Compute distance from the requesting user (if both have coordinates)
    let distance;
    const me = await User.findById(req.user._id).select("location");
    const myCoords = me?.location?.coordinates;
    const theirCoords = user.location?.coordinates;

    if (
      Array.isArray(myCoords) &&
      myCoords.length === 2 &&
      typeof myCoords[0] === "number" &&
      typeof myCoords[1] === "number" &&
      Array.isArray(theirCoords) &&
      theirCoords.length === 2 &&
      typeof theirCoords[0] === "number" &&
      typeof theirCoords[1] === "number"
    ) {
      // Haversine distance in kilometers
      const [lon1, lat1] = myCoords;
      const [lon2, lat2] = theirCoords;
      const R = 6371;
      const toRad = (d) => (d * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) ** 2;
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
// GET /api/users/nearby?radius=5
// ==========================================
exports.nearby = async (req, res) => {
  try {
    const radiusKm = Number(req.query.radius || 5);
    const radiusMeters = radiusKm * 1000;

    const me = await User.findById(req.user._id);

    // Verify my own location is set and valid
    const coords = me?.location?.coordinates;
    if (
      !Array.isArray(coords) ||
      coords.length !== 2 ||
      typeof coords[0] !== "number" ||
      typeof coords[1] !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Your location is not set. Please enable location access in your browser.",
      });
    }

    // NEW: exclude users I blocked AND users who blocked me
    const myBlockedIds = (me.blockedUsers || []).map((id) => String(id));

    const users = await User.find({
      _id: {
        $ne: me._id,
        $nin: myBlockedIds,   // skip users I blocked
      },
      isBlocked: false,
      showInDiscovery: true,
      // skip users who blocked me (their blockedUsers array contains my id)
      blockedUsers: { $ne: me._id },
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: coords },
          $maxDistance: radiusMeters,
        },
      },
    })
      .select("-password -email")
      .limit(50);

    res.json({ success: true, users });
  } catch (err) {
    console.error("nearby error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    // If no file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // The URL path to save in the database
    const avatarUrl = `/uploads/${req.file.filename}`;

    // Update the user in the database
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: avatarUrl },
      { new: true }
    ).select("-password");

    res.status(200).json({ message: "Avatar updated", user });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ message: "Server error during upload" });
  }
};