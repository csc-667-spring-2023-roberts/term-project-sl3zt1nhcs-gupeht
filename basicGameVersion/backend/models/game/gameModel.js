const db = require("../../database/db");
const { CustomError } = require("../../middleware/customErrorHandler");
const PokerGame = require("./pokerGame");
const tableModel = require("../table/tableModel");
const chatModel = require("../chat/chatModel");
const gameModel = {};
/*
This function creates a new game by calling the tableModel.createTable 
method with the provided parameters (tableName, maxPlayers, minBuyIn, maxBuyIn).
It then inserts a new game record into the games table with 
the created table_id and current start time. If successful, it 
creates a new PokerGame instance, stores the game data in the
games_data table, and creates a chat room associated with the game.
Finally, it returns the gameId.
*/
gameModel.createGame = (tableName, maxPlayers, minBuyIn, maxBuyIn) => {
    return tableModel
        .createTable(tableName, maxPlayers, minBuyIn, maxBuyIn)
        .then((tableId) => {
            const query = `INSERT INTO games (table_id, start_time) VALUES ($1, NOW()) RETURNING game_id`;
            const values = [tableId];

            return db.query(query, values);
        })
        .then((result) => {
            if (result.rowCount > 0) {
                const gameId = result.rows[0].game_id;
                const pokerGame = new PokerGame(maxPlayers); // Update the constructor call
                return Promise.all([gameModel.storeGame(gameId, pokerGame), chatModel.createChatRoom(gameId)]).then(() => gameId);
            } else {
                throw new CustomError("Failed to create game", 500);
            }
        })
        .catch((err) => {
            throw err;
        });
};

/*
This function stores a PokerGame instance in the games_data table. 
It takes the gameId and the pokerGame object, serializes the game object 
using the toJson method, and inserts the data into the table. 
If the operation is unsuccessful, it throws a custom error.
*/
gameModel.storeGame = (gameId, pokerGame) => {
    const query = `INSERT INTO games_data (game_id, game_data) VALUES ($1, $2)`;
    const values = [gameId, pokerGame.toJson()];

    return db
        .query(query, values)
        .then((result) => {
            if (result.rowCount === 0) {
                throw new CustomError("Failed to store game data", 500);
            }
        })
        .catch((err) => {
            throw err;
        });
};
/*
This function loads a PokerGame instance from the games_data 
table by its gameId. It fetches the game data and, if found,
deserializes it using the PokerGame.fromJson method.
If the game data is not found, it throws a custom error.
*/
gameModel.loadGame = (gameId) => {
    const query = `SELECT game_data FROM games_data WHERE game_id = $1`;
    const values = [gameId];

    return db
        .query(query, values)
        .then((result) => {
            if (result.rowCount > 0) {
                const gameData = result.rows[0].game_data;
                return PokerGame.fromJson(gameData);
            } else {
                throw new CustomError("Game not found", 404);
            }
        })
        .catch((err) => {
            throw err;
        });
};
/*
This function updates an existing PokerGame instance in the games_data table. 
It takes the gameId and the pokerGame object, serializes the game object 
using JSON.stringify, and updates the table entry.
If the update is unsuccessful, it throws a custom error.
*/
gameModel.updateGame = (gameId, pokerGame) => {
    const query = `UPDATE games_data SET game_data = $2 WHERE game_id = $1`;
    const values = [gameId, JSON.stringify(pokerGame)];

    return db
        .query(query, values)
        .then((result) => {
            if (result.rowCount === 0) {
                throw new CustomError("Failed to update game data", 500);
            }
        })
        .catch((err) => {
            throw err;
        });
};
/*
This function retrieves the game associated with a given tableId
from the games table. If the game is not found, 
it throws a custom error.
*/
gameModel.getGameByTableId = (tableId)=>{
    const query = `Select * FROM games WHERE table_id = $1`;
    const values = [tableId];
    return db.query(query,values)
    .then((result)=>{
        if ( result.rows.length ===0){
            throw new CustomError("Game not found",404)
        }
        return result.rows[0];
    })
    .catch((err)=>{
        throw err;
    });
};
/*
This function adds players to a game. It first loads the PokerGame instance
associated with the given gameId, then calls the addPlayers method 
on the PokerGame instance with the playerIds parameter. 
Finally, it updates the game data in the games_data table.
*/
gameModel.addPlayersToGame = (gameId, playerIds) => {
    return gameModel
        .loadGame(gameId)
        .then((pokerGame) => {
            pokerGame.addPlayers(playerIds);
            return gameModel.updateGame(gameId, pokerGame);
        })
        .catch((err) => {
            throw err;
        });
};

/*
This function removes a player from a game. It first loads the PokerGame instance 
associated with the given gameId, then calls the removePlayer method on the PokerGame 
instance with the playerId parameter. Finally, it updates the game data in the games_data table.
*/
gameModel.removePlayerFromGame = (gameId, playerId) => {
    return gameModel
        .loadGame(gameId)
        .then((pokerGame) => {
            pokerGame.removePlayer(playerId);
            return gameModel.updateGame(gameId, pokerGame);
        })
        .catch((err) => {
            throw err;
        });
};
/*
This function plays a round of poker for the game with the given gameId.
It first loads the PokerGame instance, then calls the playRound method on
the instance. Finally, it updates the game data in the games_data tab
*/
gameModel.playRound = (gameId) => {
    return gameModel
        .loadGame(gameId)
        .then((pokerGame) => {
            pokerGame.playRound();
            return gameModel.updateGame(gameId, pokerGame.toJson());
        })
        .catch((err) => {
            throw err;
        });
};

module.exports = gameModel;
