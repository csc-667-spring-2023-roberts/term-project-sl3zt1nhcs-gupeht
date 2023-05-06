const db = require("../../database/db");
const { CustomError } = require("../../middleware/customErrorHandler");
const PokerGame = require("./pokerGame");
const tableModel = require("../table/tableModel");
const gameModel = {};


gameModel.createGame =  (gameName, maxPlayers, minBuyIn, maxBuyIn) => {

    const createGameQuery = `INSERT INTO games (name, start_time) VALUES ($1, NOW()) RETURNING game_id`;
    const gameValues = [gameName];

    return  db.query(createGameQuery, gameValues)
        .then(  (gameResult) => {
            if (gameResult.rowCount > 0) {
                const gameId = gameResult.rows[0].game_id;
                const createTableQuery = `INSERT INTO tables (game_id, max_players, min_buy_in, max_buy_in) VALUES ($1, $2, $3, $4)`;
                const tableValues = [gameId, maxPlayers, minBuyIn, maxBuyIn];
                return  tableModel.createTable(createTableQuery, tableValues)      
             }
        })
        .then(  (tableResult) => {
            if (tableResult.rowCount > 0) {
                const pokerGame = new PokerGame(maxPlayers); 
                return  gameModel.storeGame(gameId, pokerGame);
            } 
         
        })
        .catch((err) => {
            throw err;
        });
    };

    

gameModel.getAllGames = async () => {
    const query = `
        SELECT games.game_id, games.name, games.start_time, tables.max_players, tables.min_buy_in, tables.max_buy_in,
        COUNT(players.player_id) AS num_players
        FROM games
        JOIN tables ON games.game_id = tables.game_id
        LEFT JOIN players ON games.game_id = tables.game_id
        GROUP BY games.game_id, tables.max_players, tables.min_buy_in, tables.max_buy_in
        
        `;
    return await db.query(query)
        .then((result) => {
            if (result.rowCount === 0){
                return [];
            }
            return result.rows;
        })
        .catch((err) => {
            throw err;
        });
};



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


//TODO
/*

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

gameModel.updateGame = (gameId, pokerGame) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE games_data SET game_data = $2 WHERE game_id = $1`;
      const values = [gameId, JSON.stringify(pokerGame)];
  
      db.query(query, values)
        .then((result) => {
          if (result.rowCount === 0) {
            reject(new CustomError("Failed to update game data", 500));
          } else {
            resolve();
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
  

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

gameModel.addPlayerToGame = (gameId, playerId) => {
    return gameModel
        .loadGame(gameId)
        .then((pokerGame) => {
            pokerGame.addPlayer(playerId);
            return gameModel.updateGame(gameId, pokerGame);
        })
        .catch((err) => {
            throw err;
        });
};

gameModel.isPlayerInGame = (playerId, gameId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT COUNT(*) 
                       FROM players 
                       WHERE player_id = $1 AND game_id = $2`;
        const values = [playerId, gameId];

        db.query(query, values)
            .then((result) => {
                resolve(result.rows[0].count > 0);
            })
            .catch((err) => {
                console.error(err);
                reject(err);
            });
    });
};


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

gameModel.joinGame = (gameId, userId, buyIn) => {
    return gameModel.loadGame(gameId)
        .then((pokerGame) => {
            if (pokerGame.players.length < pokerGame.maxPlayers) {
                const playerId = pokerGame.addPlayer(userId, buyIn);
                const query = `INSERT INTO players (user_id, game_id, buy_in, cash_out) VALUES ($1, $2, $3, 0) RETURNING player_id`;
                const values = [userId, gameId, buyIn];

                return db.query(query, values)
                    .then((result) => {
                        if (result.rowCount > 0) {
                            return result.rows[0].player_id;
                        } else {
                            throw new CustomError("Failed to add player to game", 500);
                        }
                    })
                    .then((playerId) => {
                        return gameModel.updateGame(gameId, pokerGame)
                            .then(() => {
                                return { playerId, userId };
                            });
                    });
            } else {
                throw new CustomError("Game is full", 400);
            }
        })
        .then(({ playerId, userId }) => {
            const query = `SELECT username FROM users WHERE user_id = $1`;
            const values = [userId];

            return db.query(query, values)
                .then((result) => {
                    if (result.rowCount > 0) {
                        return { playerId, username: result.rows[0].username };
                    } else {
                        throw new CustomError("User not found", 404);
                    }
                });
        })
        .catch((err) => {
            throw err;
        });
};
*/


module.exports = gameModel;
