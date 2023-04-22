const socketIO = require("socket.io");
const chatModel = require("../models/chatModel");

let io;

const initChatSocket = (server) => {
  io = socketIO(server);

  io.on("connection", (socket) => {
    console.log("New chat connection");

    // Listen for gameCreated event
    socket.on("gameCreated", (game_id) => {
      console.log(`Game created: ${game_id}`);
      // Create a new chat room with the game_id as its name
      socket.join(game_id);
    });

    // Listen for playerJoinedGame event
    socket.on("playerJoinedGame", (data) => {
      console.log(`Player ${data.player_id} joined game ${data.game_id}`);
      // Add the player to the game's chat room
      socket.join(data.game_id);
    });

    // Listen for playerLeftGame event
    socket.on("playerLeftGame", (data) => {
      console.log(`Player ${data.player_id} left game ${data.game_id}`);
      // Remove the player from the game's chat room
      socket.leave(data.game_id);
    });

    // Listen for gameEnded event
    socket.on("gameEnded", (game_id) => {
      console.log(`Game ended: ${game_id}`);
      // Close the game's chat room
      socket.leave(game_id);
    });

  });
  
};
  

module.exports = { initChatSocket };
