const gameModel = require("../models/game/gameModel");
const tableModel = require("../models/table/tableModel");
const gameController = {};

gameController.createGame = (req, res, next) => {
    const result = {};

    const { tableName, maxPlayers, minBuyIn, maxBuyIn } = req.body;

    tableModel
        .createTable(tableName, maxPlayers, minBuyIn, maxBuyIn)
        .then((tableId) => {
            result.tableId = tableId;
            result.tabeData = {
                tableName,
                maxPlayers,
                minBuyIn,
                maxBuyIn,
            };
            return gameModel.createGame(tableId);
        })
        .then((gameId) => {
            result.gameId = gameId;
            res.status(201).json(result);
        })
        .catch((err) => {
            result.error = err.message;
            res.status(err.status || 500).json(result);
            next(err);
        });
};

gameController.updateGame = (req, res, next) => {
    const { gameId } = req.params;
    const { pokerGame } = req.body;

    gameModel
        .updateGame(gameId, pokerGame)
        .then(() => {
            res.status(200).json({ success: true, message: "Game updated" });
        })
        .catch((err) => {
            next(err);
        });
};

gameController.addPlayersToGame = (req, res, next) => {
    const { gameId, playerIds } = req.body;

    gameModel
        .addPlayersToGame(gameId, playerIds)
        .then(() => {
            res.status(200).json({ success: true, message: "Players added to game" });
        })
        .catch((err) => {
            next(err);
        });
};

gameController.removePlayerFromGame = (req, res, next) => {
    const { gameId, playerId } = req.body;

    gameModel
        .removePlayerFromGame(gameId, playerId)
        .then(() => {
            res.status(200).json({ success: true, message: "Player removed from game" });
        })
        .catch((err) => {
            next(err);
        });
};

gameController.getTableByGameId = (req, res, next) => {
    const { gameId } = req.params;

    gameModel
        .getTableIdByGameId(gameId)
        .then((tableId) => {
            return tableModel.getTableById(tableId);
        })
        .then((table) => {
            res.status(200).json(table);
        })
        .catch((err) => {
            next(err);
        });
};

gameController.getGameState = (req, res, next) => {
    const { gameId } = req.params;
    gameModel
        .loadGame(gameId)
        .then((pokerGame) => {
            res.status(200).json(pokerGame.getState());
        })
        .catch((err) => {
            next(err);
        });
};

gameController.handlePlayerAction = (req, res, next) => {
    const { gameId } = req.params;
    const { playerId, action, amount } = req.body;

    gameModel
        .loadGame(gameId)
        .then((pokerGame) => {
            pokerGame.handlePlayerAction(playerId, action, amount);
            return gameModel.updateGame(gameId, pokerGame);
        })
        .then(() => {
            res.status(200).json({ success: true, message: "Player action handled" });
        })
        .catch((err) => {
            next(err);
        });
};



gameController.playRound = (req, res, next) => {
    const { gameId } = req.params;
    gameModel.loadGame(gameId).then((pokerGame) => {
        pokerGame.handlePlayerAction(playerId, action, amount);
        return gameModel
            .updateGame(gameId, pokerGame)
            .then(() => {
                res.status(200).json({ success: true, message: "Player action handler" });
            })
            .catch((err) => {
                next(err);
            });
    });
};

module.exports = gameController;
