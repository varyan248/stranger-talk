require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const app = require("./app"); // 🔥 This imports app.js
const socketInit = require("./sockets/socket");

connectDB();
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