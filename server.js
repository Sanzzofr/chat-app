const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let users = [];

// Serve static files
app.use(express.static("public"));

// On client connection
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle user joining
  socket.on("join", (username) => {
    socket.username = username;
    users.push(username);
    io.emit("userList", users);
    console.log(`${username} joined the chat`);
  });

  // Handle sending messages
  socket.on("chatMessage", (data) => {
    io.emit("chatMessage", data);
  });

  // Handle typing
  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);
  });

  socket.on("stopTyping", () => {
    socket.broadcast.emit("stopTyping");
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    users = users.filter((user) => user !== socket.username);
    io.emit("userList", users);
    console.log(`${socket.username} left the chat`);
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
