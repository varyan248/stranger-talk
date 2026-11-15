const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const {
  getStats,
  getAnalytics,
  getUsers,
  getUser,
  suspendUser,
  unsuspendUser,
  warnUser,
  getReports,
  getReport,
  updateReportStatus,
  getSettings,
  updateSettings,
} = require("../controllers/adminController");

// Every admin route requires auth + admin role
router.use(auth);
router.use(adminOnly);

// Dashboard
router.get("/stats", getStats);
router.get("/analytics", getAnalytics);

// Users
router.get("/users", getUsers);
router.get("/users/:id", getUser);
router.put("/users/:id/suspend", suspendUser);
router.put("/users/:id/unsuspend", unsuspendUser);
router.post("/users/:id/warn", warnUser);

// Reports
router.get("/reports", getReports);
router.get("/reports/:id", getReport);
router.put("/reports/:id", updateReportStatus);

// Settings
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

module.exports = router;