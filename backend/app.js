const express = require("express");
const cors = require("cors"); // 🔥 Bring CORS back here
const rateLimit = require("express-rate-limit");

const app = express();

const allowedOrigins = [
  "https://stranger-talk-five.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174"
];

// 🔥 CORS MUST BE FIRST, BEFORE ROUTES
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // 1. Allow all localhost addresses
      if (origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }

      // 2. Allow your specific production domain
      if (origin === 'https://stranger-talk-five.vercel.app') {
        return callback(null, true);
      }

      // 3. Allow any URL ending in .vercel.app
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // Block everything else
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use("/api", rateLimit({ windowMs: 60 * 1000, max: 120 }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "NearTalk API running" });
});

// Routes (They all start with /api)
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