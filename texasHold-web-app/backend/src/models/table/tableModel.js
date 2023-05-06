const db = require("../../database/db");
const { CustomError } = require("../../middleware/customErrorHandler");

const tableModel = {};

tableModel.createTable = ( maxPlayers, minBuyIn, maxBuyIn) => {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO tables ( max_players, min_buy_in, max_buy_in) VALUES ($1, $2, $3)`;
        const values = [ maxPlayers, minBuyIn, maxBuyIn];
        db.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    resolve();
                } else {
                    reject(new CustomError("Failed to create table", 500));
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
};

/*
tableModel.getTableById = (tableId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM tables WHERE table_id = $1`;
        const values = [tableId];

        db.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    resolve(result.rows[0]);
                } else {
                    reject(new CustomError("Table not found", 404));
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
};

*/


module.exports = tableModel;
