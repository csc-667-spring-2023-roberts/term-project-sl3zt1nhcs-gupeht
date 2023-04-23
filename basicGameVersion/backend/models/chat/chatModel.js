const db = require('../../database/db');
const { CustomError } = require('');

const chatModel = {};

chatModel.createChatRoom = (gameId) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO chat_rooms (game_id) VALUES ($1)`;
    const values = [gameId];

    db.query(query, values)
      .then((result) => {
        if (result.rowCount > 0) {
          resolve(true);
        } else {
          reject(new CustomError('No rows affected', 404));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};


chatModel.addMessage = (userId, gameId, message) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO chat_messages (user_id, game_id, message, created_at) VALUES ($1, $2, $3, NOW())`;
    const values = [userId, gameId, message];

    db.query(query, values)
      .then((result) => {
        if (result.rowCount > 0) {
          resolve(true);
        } else {
          reject(new CustomError('No rows affected', 404));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

chatModel.getMessages = (gameId) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT cm.chat_message_id, u.username, cm.message, cm.created_at 
                   FROM chat_messages cm 
                   INNER JOIN users u ON cm.user_id = u.user_id 
                   WHERE cm.game_id = $1 
                   ORDER BY cm.created_at ASC 
                   LIMIT 50`;
    const values = [gameId];

    db.query(query, values)
      .then((result) => {
        resolve(result.rows);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = chatModel;
