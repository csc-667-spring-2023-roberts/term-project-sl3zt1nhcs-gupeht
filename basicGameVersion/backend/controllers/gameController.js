const gameModel = require("../models/game/gameModel");
const tableModel = require("../models/table/tableModel");
const gameController = {};
/*
Note: By calling loadGame, you retrieve the game data from the database
and deserialize it into a PokerGame instance. This instance can then be 
used to perform various game-related actions such as adding or removing players,
handling player actions, or playing a round. Once the operations are complete,
you can update the game state in the database using the updateGame function.
This process of loading the game, performing actions, and then updating the
game helps ensure that the game state remains consistent and up-to-date
across different requests and operations.
*/

/*
This function handles the request for creating a new game. 
It takes the necessary parameters from the request body, such as tableName, 
maxPlayers, minBuyIn, and maxBuyIn, then calls the createTable method 
in the tableModel and the createGame method in the gameModel. 
It then sends a JSON response with the tableId and gameId in the result object. 
If there's an error, it sends an error response and calls the next middleware 
with the error object.
*/
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

/*
This function handles the request for updating a game. 
It extracts the gameId from the request parameters and 
the pokerGame object from the request body. 
It then calls the updateGame method in the gameModel.
If the operation is successful, it sends a JSON response with the
updated game data; otherwise, it sends an error response and calls 
the next middleware with the error object.
*/
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

/*
This function handles the request for adding players to a game. 
It takes the gameId and playerIds from the request body and calls the 
addPlayersToGame method in the gameModel. If the operation is successful,
it sends a JSON response with the gameId and playerIds; otherwise, 
it sends an error response and calls the next middleware with the error object.
*/
gameController.addPlayersToGame = (req, res, next) => {
    const { gameId, playerIds } = req.body;
    const result = {};
    gameModel
        .addPlayersToGame(gameId, playerIds)
        .then( async() => {
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
/*
This function handles the request for removing a player from a game.
It takes the gameId and playerId from the request body and calls the 
removePlayerFromGame method in the gameModel. If the operation is successful, 
it sends a JSON response with the gameId and playerId; otherwise, 
it sends an error response and calls the next middleware with the error object.
*/
gameController.removePlayerFromGame = (req, res, next) => {
    const { gameId, playerId } = req.body;
    const result = {};
    gameModel
        .removePlayerFromGame(gameId, playerId)
        .then(() => {
            result.success = true;
            result.gameId = gameId;
            result.message = `Players : ${result.playerIds} removed from game ${result.gameId}`;
            res.status(200).json(result);
        })
        .catch((err) => {
            result.error = err.message;
            res.status(err.status || 500).json(result);
            next(err);
        });
};
/*
This function handles the request for getting a table and its associated game.
It takes the tableId from the request parameters and calls the getTableById
method in the tableModel and the getGameByTableId method in the gameModel. 
If successful, it sends a JSON response with the table and game data;
otherwise, it sends an error response and calls the next middleware
with the error object.
*/
gameController.getTable = (req, res, next) => {
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
            next(err);
        });
};
/*
This function handles the request for getting the current game state.
It takes the gameId from the request parameters and calls the loadGame method in the gameModel.
If successful, it sends a JSON response with the game state;
otherwise, it sends an error response and calls the next middleware with the error object.
*/
gameController.getGameState = (req, res, next) => {
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
            next(err);
        });
};
/*
This function handles the request for handling a player's action in a game. 
It takes the gameId from the request parameters and the playerId, action,
and amount from the request body. It then calls the loadGame and updateGame 
methods in the gameModel. If successful, it sends a JSON response
with the action details; otherwise, it sends an error response and 
calls the next middleware with the error object.
*/
gameController.handlePlayerAction = (req, res, next) => {
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
            next(err);
        });
};
/*
This function handles the request for playing a round in a game. 
It takes the gameId from the request parameters and calls the loadGame 
and updateGame methods in the gameModel. If successful, it sends a JSON response indicating that the round has been played; otherwise, it sends an error response and calls the next middleware with the error object.
*/
gameController.playRound = (req, res, next) => {
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
            next(err);
        });
};

module.exports = gameController;
