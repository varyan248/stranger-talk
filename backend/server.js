require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const app = require("./app");
const socketInit = require("./sockets/socket");

connectDB();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5174",
  "https://stranger-talk-five.vercel.app" // Your live Vercel frontend
];

// 1. Enable CORS BEFORE anything else
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 2. Explicitly handle OPTIONS preflight requests for all routes
app.options("*", cors()); 

// 3. Now you can set up Socket.IO and import your routes from app.js
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