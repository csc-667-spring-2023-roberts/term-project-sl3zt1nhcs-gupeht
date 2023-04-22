const db = require('../database/db');
const { CustomError } = require('../middleware/customErrorHandler');

const handModel = {};

handModel.createHand = (game_id) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO hands (game_id) VALUES ($1) RETURNING hand_id`;
    const values = [game_id];

    db.query(query, values)
      .then((result) => {
        if (result.rowCount > 0) {
          resolve(result.rows[0].hand_id);
        } else {
          reject(new CustomError('No rows affected', 404));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = handModel;
