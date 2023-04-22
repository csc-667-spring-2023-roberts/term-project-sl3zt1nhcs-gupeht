const db = require('../database/db');
const { CustomError } = require('../middleware/customErrorHandler');

const potModel = {};

potModel.createPot = (game_id, is_main_pot) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO pots (game_id, is_main_pot) VALUES ($1, $2) RETURNING pot_id`;
    const values = [game_id, is_main_pot];

    db.query(query, values)
      .then((result) => {
        if (result.rowCount > 0) {
          resolve(result.rows[0].pot_id);
        } else {
          reject(new CustomError('No rows affected', 404));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// Other pot related methods would be implemented similarly

module.exports = potModel;
