const db = require("../database/db");
const { CustomError } = require("../middleware/customErrorHandler");
const PokerGame = require("../pokerGame");
const tableModel = require("./tableModel");
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

gameModel.storeGame = async (gameId, pokerGame) => {
    try {
        const query = `INSERT INTO games_data (game_id, game_data) VALUES ($1, $2)`;
        const values = [gameId, JSON.stringify(pokerGame)];

        const result = await db.query(query, values);

        if (result.rowCount === 0) {
            throw new CustomError("Failed to store game data", 500);
        }
    } catch (err) {
        throw err;
    }
};

gameModel.loadGame = async (gameId) => {
    try {
        const query = `SELECT game_data FROM games_data WHERE game_id = $1`;
        const values = [gameId];

        const result = await db.query(query, values);

        if (result.rowCount > 0) {
            const gameData = result.rows[0].game_data;
            return PokerGame.fromJson(gameData);
        } else {
            throw new CustomError("Game not found", 404);
        }
    } catch (err) {
        throw err;
    }
};

gameModel.updateGame = async (gameId, pokerGame) => {
    try {
        const query = `UPDATE games_data SET game_data = $2 WHERE game_id = $1`;
        const values = [gameId, JSON.stringify(pokerGame)];

        const result = await db.query(query, values);

        if (result.rowCount === 0) {
            throw new CustomError("Failed to update game data", 500);
        }
    } catch (err) {
        throw err;
    }
};

gameModel.addPlayersToGame = async (gameId, playerIds) => {
    try {
        const pokerGame = await gameModel.loadGame(gameId);
        pokerGame.addPlayers(playerIds);
        await gameModel.updateGame(gameId, pokerGame);
    } catch (err) {
        throw err;
    }
};

gameModel.removePlayerFromGame = async (gameId, playerId) => {
    try {
        const pokerGame = await gameModel.loadGame(gameId);
        pokerGame.removePlayer(playerId);
        await gameModel.updateGame(gameId, pokerGame);
    } catch (err) {
        throw err;
    }
};
try {
    const pokerGame = await gameModel.loadGame(gameId);
    pokerGame.startGame();
    await gameModel.updateGame(gameId, pokerGame);
} catch (err) {
    throw err;
}

gameModel.playRound = async (gameId) => {
    try {
        const pokerGame = await gameModel.loadGame(gameId);
        pokerGame.playRound();
        await gameModel.updateGame(gameId, pokerGame);
    } catch (err) {
        throw err;
    }
};

module.exports = gameModel;
