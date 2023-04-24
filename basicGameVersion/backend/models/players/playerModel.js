const Player = require("./player");
const database = require("../db/database");

const playerModel = {};

playerModel.joinGame = (userId, gameId, nickname) => {
  return new Promise((resolve, reject) => {
    const player = new Player(userId, gameId, nickname);

    database.query(
      "INSERT INTO players (user_id, game_id, nickname) VALUES ($1, $2, $3) RETURNING id",
      [player.userId, player.gameId, player.nickname]
    )
      .then((result) => {
        resolve(result.rows[0].id);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

playerModel.leaveGame = (userId, gameId) => {
  return new Promise((resolve, reject) => {
    database.query(
      "DELETE FROM players WHERE user_id = $1 AND game_id = $2",
      [userId, gameId]
    )
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = playerModel;
