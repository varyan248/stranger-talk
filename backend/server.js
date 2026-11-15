// require("dotenv").config();
// const http = require("http");
// const { Server } = require("socket.io");
// const connectDB = require("./config/db");
// const app = require("./app");
// const socketInit = require("./sockets/socket");

// connectDB();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: process.env.CLIENT_URL,
//     credentials: true,
//   },
// });

// app.set("io", io);
// socketInit(io);

// server.listen(process.env.PORT, () =>
//   console.log(`Server on http://localhost:${process.env.PORT}`)
// );

require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors"); // 🔥 1. Import CORS
const connectDB = require("./config/db");
const app = require("./app");
const socketInit = require("./sockets/socket");

connectDB();
const server = http.createServer(app);

// 🔥 2. Add your live Vercel URL here
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5174",
  "https://stranger-talk-five.vercel.app" // Your live Vercel frontend
];

// 🔥 3. THIS FIXES THE EXPRESS HTTP ERROR (like /auth/register)
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// This fixes the WebSocket (Socket.IO) connection
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