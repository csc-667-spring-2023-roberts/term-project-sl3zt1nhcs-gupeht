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
            return gameModel.createGame(tableName, maxPlayers, minBuyIn, maxBuyIn);

        })
        .then((gameData) => {
            result.gameData = gameData;
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
/*
This function handles the request for removing a player from a game.
It takes the gameId and playerId from the request body and calls the 
removePlayerFromGame method in the gameModel. If the operation is successful, 
it sends a JSON response with the gameId and playerId; otherwise, 
it sends an error response and calls the next middleware with the error object.
*/
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

/*
This function handles the request for getting a table and its associated game.
It takes the tableId from the request parameters and calls the getTableById
method in the tableModel and the getGameByTableId method in the gameModel. 
If successful, it sends a JSON response with the table and game data;
otherwise, it sends an error response and calls the next middleware
with the error object.
*/
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

gameController.getGameList = ( res ) => {
    gameModel
        .getAllGames()
        .then((games) => {
            res.status(200).json(games);
        })
        .catch((err) => {
            res.status(err.status || 500).json({ error: err.message });
        
        });
};




/*
This function handles the request for getting the current game state.
It takes the gameId from the request parameters and calls the loadGame method in the gameModel.
If successful, it sends a JSON response with the game state;
otherwise, it sends an error response and calls the next middleware with the error object.
*/
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
/*
This function handles the request for handling a player's action in a game. 
It takes the gameId from the request parameters and the playerId, action,
and amount from the request body. It then calls the loadGame and updateGame 
methods in the gameModel. If successful, it sends a JSON response
with the action details; otherwise, it sends an error response and 
calls the next middleware with the error object.
*/
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
/*
This function handles the request for playing a round in a game. 
It takes the gameId from the request parameters and calls the loadGame 
and updateGame methods in the gameModel. If successful, it sends a JSON response indicating that the round has been played; otherwise, it sends an error response and calls the next middleware with the error object.
*/
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

module.exports = gameController;
