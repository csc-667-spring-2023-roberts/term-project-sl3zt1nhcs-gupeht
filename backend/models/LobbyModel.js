const db = require('../database/db');
const { CustomError } = require('../middleware/customErrorHandler');

const lobbyModel = {};

lobbyModel.createLobby = (lobby_owner, num_players, num_rounds, starting_chips) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO lobbies (lobby_owner, num_players, num_rounds, starting_chips) VALUES ($1, $2, $3, $4) RETURNING lobby_id`;
    const values = [lobby_owner, num_players, num_rounds, starting_chips];

    db.query(query, values)
      .then((result) => {
        if (result.rowCount > 0) {
          resolve(result.rows[0].lobby_id);
        } else {
          reject(new CustomError('No rows affected', 404));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// Other lobby related methods would be implemented similarly

module.exports = lobbyModel;
