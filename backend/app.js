// const express = require("express");
// const cors = require("cors");
// const rateLimit = require("express-rate-limit");

// const app = express();
// app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
// app.use(express.json());
// app.use("/api", rateLimit({ windowMs: 60 * 1000, max: 120 }));

// // app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/users", require("./routes/userRoutes"));
// app.use("/api/chat", require("./routes/chatRoutes"));
// app.use("/api/reports", require("./routes/reportRoutes"));
// app.use("/api/admin", require("./routes/adminRoutes"));

// module.exports = app;


const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

// 🔥 UPDATE THIS PART IN APP.JS
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173", // User App
  "http://localhost:5174",                           // Admin App
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use("/api", rateLimit({ windowMs: 60 * 1000, max: 120 }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "NearTalk API running" });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// 404 fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

module.exports = app;