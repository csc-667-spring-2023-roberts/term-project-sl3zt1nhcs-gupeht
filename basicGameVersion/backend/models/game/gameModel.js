const db = require("../../database/db");
const { CustomError } = require("../../middleware/customErrorHandler");
const PokerGame = require("./pokerGame");
const tableModel = require("../table/tableModel");
const chatModel = require("../chat/chatModel");
const gameModel = {};

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

gameModel.storeGame = (gameId, pokerGame) => {
    const query = `INSERT INTO games_data (game_id, game_data) VALUES ($1, $2)`;
    const values = [gameId, JSON.stringify(pokerGame.toJson())];
  
    return db.query(query, values)
      .then(result => {
        if (result.rowCount === 0) {
          throw new CustomError("Failed to store game data", 500);
        }
      })
      .catch(err => {
        throw err;
      });
  };

  gameModel.loadGame = (gameId) => {
    const query = `SELECT game_data FROM games_data WHERE game_id = $1`;
    const values = [gameId];
  
    return db.query(query, values)
      .then(result => {
        if (result.rowCount > 0) {
          const gameData = result.rows[0].game_data;
          return PokerGame.fromJson(gameData);
        } else {
          throw new CustomError("Game not found", 404);
        }
      })
      .catch(err => {
        throw err;
      });
  };

gameModel.updateGame = (gameId, pokerGame) => {
    const query = `UPDATE games_data SET game_data = $2 WHERE game_id = $1`;
    const values = [gameId, JSON.stringify(pokerGame)];

    return db.query(query, values)
        .then(result => {
            if (result.rowCount === 0) {
                throw new CustomError("Failed to update game data", 500);
            }
        })
        .catch(err => {
            throw err;
        });
};


gameModel.addPlayersToGame = (gameId, playerIds) => {
    return gameModel.loadGame(gameId)
        .then(pokerGame => {
            pokerGame.addPlayers(playerIds);
            return gameModel.updateGame(gameId, pokerGame);
        })
        .catch(err => {
            throw err;
        });
};


gameModel.removePlayerFromGame = (gameId, playerId) => {
    return gameModel.loadGame(gameId)
        .then(pokerGame => {
            pokerGame.removePlayer(playerId);
            return gameModel.updateGame(gameId, pokerGame);
        })
        .catch(err => {
            throw err;
        });
};


gameModel.playRound = (gameId) => {
    return gameModel.loadGame(gameId)
        .then(pokerGame => {
            pokerGame.playRound();
            return gameModel.updateGame(gameId, pokerGame);
        })
        .catch(err => {
            throw err;
        });
};


module.exports = gameModel;
