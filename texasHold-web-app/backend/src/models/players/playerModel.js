const db = require("../../database");
const { CustomError } = require("../../middleware/customErrorHandler");
const PokerGame = require("../game/pokerGame");

const playerModel = {};

playerModel.joinGame = (user_id, id) => {
    const queryIsGame = `SELECT game_data FROM games_data WHERE id = $1`;
    
    const value = [id];

    return db.query(queryIsGame, value)
        .then((gameData) => {
            if (gameData.rowCount === 0) {
                throw new CustomError("Game not found", 404);
            }
            const game = PokerGame.fromJson(gameData.rows[0].game_data);
            return { game, emptySeat: game.assignEmptySeat(user_id) };
        })
        .then(({ game, emptySeat }) => {
            if (!emptySeat) {
                throw new CustomError("There are no seats", 404);
            }

            const queryUpdateGameData = `UPDATE games_data SET game_data = $1 WHERE id = $2`;
            const updatedGameData = game.toJson();

            return db.query(queryUpdateGameData, [updatedGameData, id])
                .then(() => emptySeat);
        })
        .then((emptySeat) => {
            const queryPlayerSaveData = `INSERT INTO players_game_save (user_id, game_id, game_metadata)
            VALUES ($1, $2, $3)`;

            const values = [user_id, id, JSON.stringify({ seat: emptySeat })];

            return db.query(queryPlayerSaveData, values)
                .then(() => emptySeat);
        })
        .then((emptySeat) => {
            return { success: true, seat: emptySeat };
        })
        .catch((err) => {
            throw err;
        });
};

module.exports = playerModel;
