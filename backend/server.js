require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const app = require("./app"); 
const socketInit = require("./sockets/socket");
const User = require("./models/User"); // 🔥 1. Import the User model

// 🔥 2. Update connectDB to build indexes after connecting
connectDB().then(async () => {
  try {
    await User.createIndexes(); // This forces MongoDB to build the 2dsphere index!
    console.log("✅ Database indexes built successfully!");
  } catch (error) {
    console.error("❌ Error building indexes:", error);
  }
});

const server = http.createServer(app);

const allowedOrigins = [
  "https://stranger-talk-five.vercel.app", 
  "http://localhost:5173",
  "http://localhost:5174"
];

// Only CORS for Socket.IO here. Express CORS is handled in app.js
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.set("io", io);
socketInit(io);

server.listen(process.env.PORT, () =>
  console.log(`Server on http://localhost:${process.env.PORT}`)
);