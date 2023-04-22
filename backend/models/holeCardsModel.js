const db = require('../database/db');
const { CustomError } = require('../middleware/customErrorHandler');

const holeCardsModel = {};

holeCardsModel.addHoleCard = (player_id, card_id) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO hole_cards (player_id, card_id) VALUES ($1, $2)`;
    const values = [player_id, card_id];

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

module.exports = holeCardsModel;







