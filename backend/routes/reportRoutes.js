const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { createReport } = require("../controllers/reportController");
router.post("/", auth, createReport);
module.exports = router;