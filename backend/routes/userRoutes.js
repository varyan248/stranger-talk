// // const router = require("express").Router();
// // const auth = require("../middleware/authMiddleware");
// // const {
// //   updateLocation,
// //   nearby,
// //   updateProfile,
// //   getSettings,
// //   updateSettings,
// // } = require("../controllers/userController");

// // router.put("/location", auth, updateLocation);
// // router.get("/nearby", auth, nearby);
// // router.put("/profile", auth, updateProfile);
// // router.get("/settings", auth, getSettings);
// // router.put("/settings", auth, updateSettings);

// // module.exports = router;


// const router = require("express").Router();
// const auth = require("../middleware/authMiddleware");
// const {
//   updateLocation,
//   nearby,
//   updateProfile,
//   getSettings,
//   updateSettings,
//   getUserById,
// } = require("../controllers/userController");

// // ---- Static routes first ----
// router.put("/location", auth, updateLocation);
// router.get("/nearby", auth, nearby);
// router.put("/profile", auth, updateProfile);
// router.get("/settings", auth, getSettings);
// router.put("/settings", auth, updateSettings);

// // ---- Dynamic route MUST be last ----
// // If this were before /nearby, Express would treat "nearby" as a userId
// router.get("/:userId", auth, getUserById);

// module.exports = router;

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
  updateAvatar, // We will create this controller next
} = require("../controllers/userController");

// 1. Create the uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 2. Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// ---- Static routes ----
router.put("/location", auth, updateLocation);
router.get("/nearby", auth, nearby);
router.put("/profile", auth, updateProfile);
router.get("/settings", auth, getSettings);
router.put("/settings", auth, updateSettings);

// 🔥 NEW AVATAR ROUTE: 'avatar' must match the field name your frontend sends
router.post("/avatar", auth, upload.single("avatar"), updateAvatar);

// ---- Dynamic route MUST be last ----
router.get("/:userId", auth, getUserById);

module.exports = router;