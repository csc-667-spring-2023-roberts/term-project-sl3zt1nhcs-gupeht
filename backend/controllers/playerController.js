const playerModel = require('../models/playerModel');
const CustomError = require('../middleware/customErrorHandler').CustomError;

exports.createPlayer = (req, res) => {
const result = {};

const { user_id, game_id } = req.body;

playerModel
.createPlayer(user_id, game_id)
.then((player_id) => {
result.player_id = player_id;
res.status(200).json({ Result: result });
})
.catch((err) => {
result.error = err.message;
res.status(500).json({ Result: result });
});
};

exports.getPlayerById = (req, res) => {
const { player_id } = req.params;

const result = {};

playerModel
.getPlayerById(player_id)
.then((player) => {
result.player = player;
res.status(200).json({ Result: result });
})
.catch((err) => {
result.error = err.message;
res.status(500).json({ Result: result });
});
};

exports.updatePlayerStatus = (req, res) => {
const { player_id } = req.params;
const { status } = req.body;

const result = {};

playerModel
.updatePlayerStatus(player_id, status)
.then(() => {
result.message = 'Player status updated successfully';
res.status(200).json({ Result: result });
})
.catch((err) => {
result.error = err.message;
res.status(500).json({ Result: result });
});
};

exports.getPlayersByGameId = (req, res) => {
const { game_id } = req.params;

const result = {};

playerModel
.getPlayersByGameId(game_id)
.then((players) => {
result.players = players;
res.status(200).json({ Result: result });
})
.catch((err) => {
result.error = err.message;
res.status(500).json({ Result: result });
});
};

exports.getActivePlayersByGameId = (req, res) => {
const { game_id } = req.params;

const result = {};

playerModel
.getActivePlayersByGameId(game_id)
.then((players) => {
result.players = players;
res.status(200).json({ Result: result });
})
.catch((err) => {
result.error = err.message;
res.status(500).json({ Result: result });
});
};

exports.getPlayerByUserIdAndGameId = (req, res) => {
    const { user_id, game_id } = req.params;
    const result = {};
  
    playerModel
      .getPlayerByUserIdAndGameId(user_id, game_id)
      .then((player) => {
        if (!player) {
          throw new CustomError('Player not found', 404);
        }
        result.player = player;
        res.status(200).json({ Result: result });
      })
      .catch((err) => {
        if (err instanceof CustomError) {
          res.status(err.statusCode).json({ Result: { error: err.message } });
        } else {
          result.error = err.message;
          res.status(500).json({ Result: result });
        }
      });
  };