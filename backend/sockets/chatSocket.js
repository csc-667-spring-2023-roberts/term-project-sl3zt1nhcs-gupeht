const socketIO = require("socket.io");
const chatModel = require("../models/chatModel");

let io;

const initChatSocket = (server) => {
  io = socketIO(server);

  io.on("connection", (socket) => {
    console.log("New chat connection");

    socket.on("joinRoom", (roomId) => {
      console.log(`User joined room ${roomId}`);
      socket.join(roomId);
    });

    socket.on("leaveRoom", (roomId) => {
      console.log(`User left room ${roomId}`);
      socket.leave(roomId);
    });

    socket.on("message", (data) => {
      console.log(`New message received: ${data.message}`);
      chatModel
        .createMessage(data.game_id, data.player_id, data.message)
        .then(() => {
          io.to(data.game_id).emit("newMessage", data);
        })
        .catch((err) => {
          console.error(err);
        });
    });
  });
   // Handle socket connection error
   io.on("error", (err) => {
    console.error("Socket connection error:", err);
    io.emit("chatError", { message: "Chat server is currently unavailable" });
  });
};

module.exports = { initChatSocket };
