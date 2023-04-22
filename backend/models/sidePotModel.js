const db = require('../database/db');
const { CustomError } = require('../middleware/customErrorHandler');

const sidePotModel = {};

sidePotModel.createSidePot = (pot_id, side_pot_number, side_pot_amount) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO side_pots (pot_id, side_pot_number, side_pot_amount) VALUES ($1, $2, $3)`;
    const values = [pot_id, side_pot_number, side_pot_amount];

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

// Other side pot related methods would be implemented similarly

module.exports = sidePotModel;
