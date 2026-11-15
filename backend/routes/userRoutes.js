// const router = require("express").Router();
// const auth = require("../middleware/authMiddleware");
// const {
//   updateLocation,
//   nearby,
//   updateProfile,
//   getSettings,
//   updateSettings,
// } = require("../controllers/userController");

// router.put("/location", auth, updateLocation);
// router.get("/nearby", auth, nearby);
// router.put("/profile", auth, updateProfile);
// router.get("/settings", auth, getSettings);
// router.put("/settings", auth, updateSettings);

// module.exports = router;


const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  updateLocation,
  nearby,
  updateProfile,
  getSettings,
  updateSettings,
  getUserById,
} = require("../controllers/userController");

// ---- Static routes first ----
router.put("/location", auth, updateLocation);
router.get("/nearby", auth, nearby);
router.put("/profile", auth, updateProfile);
router.get("/settings", auth, getSettings);
router.put("/settings", auth, updateSettings);

// ---- Dynamic route MUST be last ----
// If this were before /nearby, Express would treat "nearby" as a userId
router.get("/:userId", auth, getUserById);

module.exports = router;