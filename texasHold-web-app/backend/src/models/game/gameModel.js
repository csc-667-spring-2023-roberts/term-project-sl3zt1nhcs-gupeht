const db = require("../../database/db");
const { CustomError } = require("../../middleware/customErrorHandler");
const PokerGame = require("./pokerGame");
const tableModel = require("../table/tableModel");
const gameModel = {};


gameModel.createGame = (name, maxPlayers, minBuyIn, maxBuyIn) => {
    const createGameQuery = `INSERT INTO games (name, start_time) VALUES ($1, NOW()) RETURNING game_id, name, start_time`;
  
    const gameValues = [name];
   
    return db.query(createGameQuery, gameValues)
        .then((gameResult) => {
            if (gameResult.rowCount > 0) {
                const gameId = gameResult.rows[0].game_id;
                return tableModel.createTable(gameId, maxPlayers, minBuyIn, maxBuyIn)
                    .then(() => {
                        const pokerGame = new PokerGame(maxPlayers);
                        gameModel.storeGame(gameId, pokerGame);
                        //Debugging 
                        console.log(gameResult.rows[0]); // Add this line to log the game object
                        return gameResult.rows[0]; // Return the game object with all properties
                    });
            }
        })
        .catch((err) => {
            throw err;
        });
};

    

gameModel.getAllGames = async () => {
    const query = `
    SELECT games.game_id, games.name, games.start_time, tables.max_players, tables.min_buy_in, tables.max_buy_in, tables.num_players
    FROM games
    JOIN tables ON games.game_id = tables.game_id
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


gameModel.getGameData = (gameId)=>{

    const query = `SELECT game_data FROM games_data WHERE game_id =$1`;

    return db.query(query,[gameId]).then((result)=>{
        if ( result.rowCount ===0){
            throw new CustomError("Game not found",404);
        }
        const pokerGame = PokerGame.fromJson(result.rows[0].game_data);

        return {
            gameId:gameId,
            maxPlayers: pokerGame.maxPlayers,
            players: pokerGame.players,
            activePlayerIndex:pokerGame.activePlayerIndex,
            communityCards: pokerGame.communityCards,
            pot: pokerGame.pot,
            currentBet: pokerGame.currentBet,
            gameState:pokerGame.gameState,

        };
    }).catch((err)=>{
        throw err;
    })
}

module.exports = gameModel;
