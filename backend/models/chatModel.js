const db = require('../database/db');
const { CustomError } = require('../middleware/customErrorHandler');

const chatModel = {};

chatModel.createMessage = (game_id, player_id, message) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO chat (game_id, player_id, message) VALUES ($1, $2, $3) RETURNING chat_id`;
    const values = [game_id, player_id, message];

    db.query(query, values)
      .then((result) => {
        if (result.rowCount > 0) {
          resolve(result.rows[0].chat_id);
        } else {
          reject(new CustomError('No rows affected', 404));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

chatModel.getMessagesByGameId = (game_id) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT c.chat_id, c.message, c.created_at, u.username 
                   FROM chat c
                   JOIN players p ON c.player_id = p.player_id
                   JOIN users u ON p.user_id = u.user_id
                   WHERE c.game_id = $1
                   ORDER BY c.created_at ASC`;
    const values = [game_id];

    db.query(query, values)
      .then((result) => {
        resolve(result.rows);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

chatModel.deleteMessagesByGameId = (game_id) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM chat WHERE game_id = $1`;
    const values = [game_id];

    db.query(query, values)
      .then((result) => {
        resolve(result.rowCount);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

chatModel.getAllChats = () => {
    return new Promise((resolve, reject) => {
      const query = `SELECT c.chat_id, c.game_id, c.player_id, c.message, c.created_at, u.username 
                     FROM chat c
                     JOIN players p ON c.player_id = p.player_id
                     JOIN users u ON p.user_id = u.user_id
                     ORDER BY c.created_at ASC`;
  
      db.query(query)
        .then((result) => {
          resolve(result.rows);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

module.exports = chatModel;