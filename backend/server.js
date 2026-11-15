require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const app = require("./app");
const socketInit = require("./sockets/socket");

connectDB();
const server = http.createServer(app);

// Explicitly include your Vercel URL
const allowedOrigins = [
  "https://stranger-talk-five.vercel.app", 
  "http://localhost:5173",
  "http://localhost:5174"
];

// CORS for Express HTTP requests
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Socket.IO setup
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