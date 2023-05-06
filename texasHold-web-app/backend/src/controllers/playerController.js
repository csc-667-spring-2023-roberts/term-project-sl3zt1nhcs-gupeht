const playerModel = require('../models/players/playerModel');
const playerController = {};


/* 
toDo

playerController.joinGame = (req, res, next) => {
  const { userId, gameId, nickname } = req.body;
  const result = {};

  playerModel
    .joinGame(userId, gameId, nickname)
    .then((playerId) => {
      result.success = true;
      result.playerId = playerId;
      result.message = `Player ${nickname} (ID: ${userId}) joined game ${gameId}`;
      res.status(200).json(result);
    })
    .catch((err) => {
      result.error = err.message;
      res.status(err.status || 500).json(result);
      next(err);
    });
};

playerController.leaveGame = (req, res, next) => {
  const { userId, gameId } = req.body;
  const result = {};

  playerModel
    .leaveGame(userId, gameId)
    .then(() => {
      result.success = true;
      result.message = `Player (ID: ${userId}) left game ${gameId}`;
      res.status(200).json(result);
    })
    .catch((err) => {
      result.error = err.message;
      res.status(err.status || 500).json(result);
      next(err);
    });
};

*/

module.exports = playerController;
