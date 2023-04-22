const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Get all chats for a given game
router.get('/game/:game_id', chatController.getChatsByGameId);

// Get chat by chat ID
router.get('/:chat_id', chatController.getChatById);

// Add a message to a chat
router.post('/:chat_id/messages', chatController.addMessage);

// Get all messages in a chat
router.get('/:chat_id/messages', chatController.getMessages);

module.exports = router;
