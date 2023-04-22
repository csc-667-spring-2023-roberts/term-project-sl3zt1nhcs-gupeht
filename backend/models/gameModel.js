const db = require('../database/db');
const { CustomError } = require('../middleware/customErrorHandler');
const tableModel = require('../models/tableModel');
const potModel = require('../models/potModel');
const lobbyModel = require('../models/LobbyModel');
const handModel = require('../models/handModel');

const gameModel = {};


gameModel.createGameAndTable = (lobby_owner, max_players, small_blind, num_players, num_rounds, starting_chips, start_time) => {
    return new Promise((resolve, reject) => {
      let created_table_id;
      let created_game_id;
      let created_lobby_id;
  
      tableModel.createTable(max_players, small_blind)
        .then((table_id) => {
          created_table_id = table_id;
          const createGameQuery = `INSERT INTO games (table_id, start_time) VALUES ($1, $2) RETURNING game_id`;
          const gameValues = [table_id, start_time];
          return db.query(createGameQuery, gameValues);
        })
        .then((gameResult) => {
          if (gameResult.rowCount === 0) {
            throw new CustomError('Failed to create game', 500);
          } else {
            created_game_id = gameResult.rows[0].game_id;
            return lobbyModel.createLobby(lobby_owner, num_players, num_rounds, starting_chips);
          }
        })
        .then((lobby_id) => {
          created_lobby_id = lobby_id;
          return potModel.createPot(created_game_id, true);
        })
        .then(() => {
          // Create a community hand for the game
          return handModel.createHand(null, created_table_id, created_game_id, true);
        })
        .then(() => {
          resolve({ table_id: created_table_id, game_id: created_game_id, lobby_id: created_lobby_id });
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  gameModel.getAllPlayersInGame = (game_id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.player_id, u.username
        FROM players p
        INNER JOIN users u ON p.user_id = u.user_id
        WHERE p.game_id = $1
      `;
      const values = [game_id];
  
      db.query(query, values)
        .then(result => {
          resolve(result.rows);
        })
        .catch(err => {
          reject(err);
        });
    });
  };


  gameModel.getGameById = (game_id) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM games WHERE game_id = $1';
      const values = [game_id];
  
      db.query(query, values)
        .then(result => {
          if (result.rowCount > 0) {
            resolve(result.rows[0]);
          } else {
            reject(new CustomError('Game not found', 404));
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  };
  
  gameModel.getGamesByPlayerId = (player_id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT g.* FROM games g
        INNER JOIN players p ON p.game_id = g.game_id
        WHERE p.player_id = $1
      `;
      const values = [player_id];
  
      db.query(query, values)
        .then(result => {
          if (result.rowCount > 0) {
            resolve(result.rows);
          } else {
            reject(new CustomError('No games found for this player', 404));
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  };
  
  gameModel.updateGame = (game_id, updateData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let updateFields = [];
        let updateValues = [game_id];
        let updateIndex = 2;
  
        for (let key in updateData) {
          if (updateData.hasOwnProperty(key)) {
            updateFields.push(`${key} = $${updateIndex}`);
            updateValues.push(updateData[key]);
            updateIndex++;
          }
        }
  
        const query = `
          UPDATE games
          SET ${updateFields.join(', ')}
          WHERE game_id = $1
        `;
  
        const result = await db.query(query, updateValues);
  
        if (result.rowCount > 0) {
          resolve(true);
        } else {
          reject(new CustomError('No rows affected', 404));
        }
      } catch (err) {
        reject(err);
      }
    });
  };
  
gameModel.deleteGame = (game_id) => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM games WHERE game_id = $1';
      const values = [game_id];
  
      db.query(query, values)
        .then(result => {
          if (result.rowCount > 0) {
            resolve(true);
          } else {
            reject(new CustomError('No rows affected', 404));
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  };

gameModel.startNextRound = (game_id) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Retrieve the current game data
        const gameData = await gameModel.getGameById(game_id);
  
        // Increment the round_number
        const updatedRoundNumber = gameData.round_number + 1;
  
        // Update the game with the new round_number
        await gameModel.updateGame(game_id, { round_number: updatedRoundNumber });
  
        // Add any additional logic needed to start a new round, such as updating players' statuses, resetting bets, etc.
  
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  };
  
  gameModel.advancePlayerTurn = (game_id) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Retrieve the current game data
        const gameData = await gameModel.getGameById(game_id);
  
        // Increment the player_number
        const updatedPlayerNumber = (gameData.player_number + 1) % gameData.max_players;
  
        // Update the game with the new player_number
        await gameModel.updateGame(game_id, { player_number: updatedPlayerNumber });
  
        // Add any additional logic needed to advance the player turn, such as updating the current player's status, etc.
  
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  };


module.exports = gameModel;