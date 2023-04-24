const db = require('../../database/db');
const { CustomError } = require("../../middleware/customErrorHandler");

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


chatModel.addMessage = (playerId, gameId, message) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO chat_messages (player_id, game_id, message, created_at) VALUES ($1, $2, $3, NOW())`;
    const values = [playerId, gameId, message];

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
    const query = `SELECT cm.chat_message_id, p.name as player_name, cm.message, cm.created_at 
                   FROM chat_messages cm 
                   INNER JOIN players p ON cm.player_id = p.player_id 
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
