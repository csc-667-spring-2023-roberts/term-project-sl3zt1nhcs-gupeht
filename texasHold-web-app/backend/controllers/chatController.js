const chatModel = require('../models/chat/chatModel');

let io;

const chatController = {};

chatController.setIoInstance = (socketIoInstance) => {
  io = socketIoInstance;
};

chatController.addMessage = async (playerId, gameId, message) => {
  await chatModel.addMessage(playerId, gameId, message);
  const messages = await chatModel.getMessages(gameId);

  io.to(`game_${gameId}`).emit('chat_messages', messages);
};
chatController.getMessages = (gameId) => {
  return chatModel.getMessages(gameId);
};

module.exports = chatController;
