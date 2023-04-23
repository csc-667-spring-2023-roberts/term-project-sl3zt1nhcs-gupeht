const setupSocket = (server) => {
    const io = require('socket.io')(server);
    const chatController = require('./controllers/chatController');
  
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
  
      socket.on('join_game', async (gameId) => {
        socket.join(`game_${gameId}`);
        const messages = await chatController.getMessages(gameId);
        socket.emit('chat_messages', messages);
      });
  
      socket.on('send_message', async ({ userId, gameId, message }) => {
        await chatController.addMessage(userId, gameId, message);
      });
  
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  
    return io;
  };
  
  module.exports = setupSocket;
  