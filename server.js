const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http"); // 1. Import HTTP
const { Server } = require("socket.io"); // 2. Import Socket.io
require("dotenv").config();

const app = express();
const server = http.createServer(app); // 3. Create HTTP server

// 4. Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: "*", // For development, allow all. In production, restrict this.
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors());

// --- Database Connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

// --- Routes ---
// --- Routes ---
// Use plural consistently to match your frontend Api.get('/chats')
app.use("/api/auth", require("./routes/auth"));
app.use("/api/chats", require("./routes/chatRoutesTEMP")); 
app.use("/api/messages", require("./routes/messageRoutes"));

// --- Socket.io Logic ---
io.on("connection", (socket) => {
  console.log("⚡ A user connected:", socket.id);

  // Join a specific chat room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // Handle sending messages
  socket.on("send_message", (data) => {
    io.to(data.roomId).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("🔥 User disconnected");
  });

  socket.on("typing", (roomId) => socket.in(roomId).emit("typing", roomId));
  socket.on("stop_typing", (roomId) =>
    socket.in(roomId).emit("stop_typing", roomId),
  );
});

// 5. Change app.listen to server.listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Pulse Server running on port ${PORT}`));
