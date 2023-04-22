const db = require('../database/db');
const { CustomError } = require('../middleware/customErrorHandler');

const betModel = {};

betModel.placeBet = (player_id, hand_id, amount) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO bets (player_id, hand_id, amount) VALUES ($1, $2, $3)`;
    const values = [player_id, hand_id, amount];

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

module.exports = betModel;
