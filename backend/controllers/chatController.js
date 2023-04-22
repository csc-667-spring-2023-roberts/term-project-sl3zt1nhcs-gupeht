const chatModel = require('../models/chatModel');

exports.getChatsByGameId = (req, res) => {
  const { game_id } = req.params;

  chatModel
    .getChatsByGameId(game_id)
    .then((chats) => {
      res.status(200).json({ chats });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

exports.getChatById = (req, res) => {
  const { chat_id } = req.params;

  chatModel
    .getChatById(chat_id)
    .then((chat) => {
      res.status(200).json({ chat });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

exports.addMessage = (req, res) => {
  const { chat_id } = req.params;
  const { user_id, content } = req.body;

  chatModel
    .addMessage(chat_id, user_id, content)
    .then((message) => {
      res.status(201).json({ message });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

exports.getMessages = (req, res) => {
  const { chat_id } = req.params;

  chatModel
    .getMessages(chat_id)
    .then((messages) => {
      res.status(200).json({ messages });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};
