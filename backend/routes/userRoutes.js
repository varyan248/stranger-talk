const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  updateLocation,
  nearby,
  updateProfile,
  getSettings,
  updateSettings,
  getUserById,
  updateAvatar,
} = require("../controllers/userController");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // 🔥 Fixed: Added recursive true
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// ---- Static routes ----
router.put("/location", auth, updateLocation);
router.get("/nearby", auth, nearby);
router.put("/profile", auth, updateProfile);
router.get("/settings", auth, getSettings);
router.put("/settings", auth, updateSettings);

// 🔥 Add both POST and PUT for the avatar just to be safe
router.post("/avatar", auth, upload.single("avatar"), updateAvatar);
router.put("/avatar", auth, upload.single("avatar"), updateAvatar);

// ---- Dynamic route MUST be last ----
router.get("/:userId", auth, getUserById);

module.exports = router;