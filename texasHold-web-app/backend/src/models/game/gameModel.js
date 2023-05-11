const db = require("../../database/db");
const { CustomError } = require("../../middleware/customErrorHandler");

const gameModel = {};


gameModel.createGame = (user_id, cards, bet_amount, game_state) => {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO game_states (user_id, cards, bet_amount, game_state) VALUES ($1, $2, $3, $4) RETURNING *`;
        const values = [user_id, JSON.stringify(cards), bet_amount, JSON.stringify(game_state)];

        db.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    resolve(result.rows[0]);
                } else {
                    reject(new CustomError("No rows affected", 404));
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
};

gameModel.getGameState = (game_id, user_id) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM game_states WHERE game_id = $1 AND user_id = $2`;
        const values = [game_id, user_id];

        db.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    resolve(result.rows[0]);
                } else {
                    reject(new CustomError("Game state not found", 404));
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
};



gameModel.updateGameState = (user_id, game_id, cards, bet_amount, game_state) => {
    return new Promise((resolve, reject) => {
        const query = `UPDATE game_states SET cards = $1, bet_amount = $2, game_state = $3 WHERE user_id = $4 AND game_id = $5 RETURNING *`;
        const values = [JSON.stringify(cards), bet_amount, JSON.stringify(game_state), user_id, game_id];

        db.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    resolve(result.rows[0]);
                } else {
                    reject(new CustomError("No rows affected", 404));
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
};


gameModel.getGameIdByUserId=(user_id)=>{

    return new Promise ((resolve,reject)=>{
        const query =   `SELECT game_id FROM game_states WHERE user_id = $1 returning game_id`;
        const values = [user_id];

        db.query(query,values).then((result)=>{
            if (result.rowCount >0){
                resolve(result.rows[0]);
            }
            else{
                reject ( new CustomError("Game Id not found",404));
            }
        })
        .catch((err)=>{
            reject(err);
        });
    });
}

module.exports = gameModel;