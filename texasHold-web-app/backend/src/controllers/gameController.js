const gameModel = require("../models/game/gameModel");
const tableModel = require("../models/table/tableModel");
const gameController = {};

gameController.createGame = (req, res, next) => {
    const result = {};

    const { name, maxPlayers, minBuyIn, maxBuyIn } = req.body;

    gameModel.createGame(name, maxPlayers, minBuyIn, maxBuyIn)
        .then((game) => {
            result.name = game.name;
            result.id = game.game_id;
            result.startime = game.start_time;
            result.maxPlayers = maxPlayers;
            result.minBuyIn = minBuyIn;
            result.maxBuyIn = maxBuyIn;
            res.status(200).json(result);
        })
        .catch((err) => {
            result.error = err.message;
            res.status(err.status || 500).json(result);
            next(err);
        });
};


gameController.getGameList = (req, res, next) => {
    const result = {};

    gameModel.getAllGames()
        .then((games) => {
            result.games = games;
            res.status(200).json({result});
        })
        .catch((err) => {
            result.error = err.message;
            res.status(err.status || 500).json(result);
            next(err);
        });
};

/*
TODO

gameController.updateGame = (req, res, next) => {
    const result = {};
    const { gameId } = req.params;
    const { pokerGame } = req.body;

    gameModel
        .updateGame(gameId, pokerGame)
        .then(() => {
            result.gameId = gameId;
            result.pokerGame = pokerGame;
            result.success = true;
            result.message = "Game Updated";
            res.status(200).json(result);
        })
        .catch((err) => {
            result.error = err.message;
            res.status(err.status || 500).json(result);
            next(err);
        });
};




gameController.addPlayersToGame = (req, res, next) => {
    const { gameId, playerIds } = req.body;
    const result = {};
    gameModel
        .addPlayersToGame(gameId, playerIds)
        .then( () => {
        })
        .then((chat_data)=>{
            result.chat_data = chat_data;
            result.success = true;
            result.playerIds = playerIds;
            result.gameId = gameId;
            result.message = `Players : ${result.playerIds} added to game ${result.gameId}`;
            res.status(200).json(result);
        })
        .catch((err) => {
            result.error = err.message;
            res.status(err.status || 500).json(result);
            next(err);
        });
};


gameController.removePlayerFromGame = (req, res) => {
    const { gameId, playerId } = req.body;
    const result = {};
    gameModel
        .removePlayerFromGame(gameId, playerId)
        .then(() => {
        }).then((chat_data)=>{
            result.chat_data = chat_data;
            result.success = true;
            result.gameId = gameId;
            result.playerId = playerId; // Changed line
            result.message = `Player : ${result.playerId} removed from game ${result.gameId}`; // Changed line
            res.status(200).json(result);
        })
        .catch((err) => {
            result.error = err.message;
            res.status(err.status || 500).json(result);
        });
};


gameController.getTable = (req, res) => {
    const { tableId } = req.params;
    const result = {};
    tableModel
        .getTableById(tableId)
        .then((table) => {
            result.table = table;
            return gameModel.getGameByTableId(tableId);
        })
        .then((game) => {
            result.game = game;
            res.status(200).json(result);
        })
        .catch((err) => {
            result.error = err.message;
            res.status(err.status || 500).json(result);
        });
};




gameController.getGameState = (req, res, ) => {
    const { gameId } = req.params;
    const result = {};
    gameModel
        .loadGame(gameId)
        .then((pokerGame) => {
            result.game = gameId;
            result.loaded = true;
            result.gameState = pokerGame.getState();
            res.status(200).json(result);
        })
        .catch((err) => {
            result.error = err.message;
            res.status(err.status || 500).json(result);
        });
};

gameController.handlePlayerAction = (req, res) => {
    const { gameId } = req.params;
    const { playerId, action, amount } = req.body;
    const result = {};

    gameModel
        .loadGame(gameId)
        .then((pokerGame) => {
            pokerGame.handlePlayerAction(playerId, action, amount);
            return gameModel.updateGame(gameId, pokerGame);
        })
        .then(() => {
            result.playerId = playerId;
            result.action = action;
            result.amount = amount;
            result.success = true;
            result.message = "Player action handled";
            res.status(200).json(result);
        })
        .catch((err) => {
            result.error = err.message;
            res.status(err.status || 500).json(result);
        });
};


gameController.playRound = (req, res) => {
    const { gameId } = req.params;
    const result = {};
    gameModel
        .loadGame(gameId)
        .then((pokerGame) => {
            pokerGame.playRound();
            return gameModel.updateGame(gameId, pokerGame.toJson());
        })
        .then(() => {
            result.success = true;
            result.message = "Round played";
            res.status(200).json(result);
        })
        .catch((err) => {
            result.error = err.message;
            res.status(err.status || 500).json(result);
        });
};

gameController.joinGame = (req, res) => {
    const gameId = req.params.gameId;
    const userId = req.user.user_id;
    const buyIn = req.body.buyIn;

    const result ={}

    gameModel.joinGame(gameId, userId, buyIn)
        .then(({ playerId, username }) => {
            result.gameId= gameId;
            result.userId = userId;
            result.buyIn = buyIn;
            res.status(200).json(result)
        })
        .catch((err) => {
            result.error = err.message;
            res.status(err.status || 500).json(result); 
        });
};
*/

module.exports = gameController;
