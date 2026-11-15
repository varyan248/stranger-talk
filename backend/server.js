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
const connectDB = require("./config/db");
const app = require("./app");
const socketInit = require("./sockets/socket");

connectDB();
const server = http.createServer(app);

// 🔥 Allow both the User App (5173) and the Admin App (5174)
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5174",
];

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