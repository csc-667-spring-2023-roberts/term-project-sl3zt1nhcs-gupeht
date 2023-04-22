const db = require('../database/db');
const {CustomError} = require('../middleware/customErrorHandler');

const tableModel={};

tableModel.getTableById = (table_id) =>{

    return new Promise((resolve,reject)=>{
        const query = `SELECT * FROM game_tables WHERE table_id = $1`;
        const values = [table_id];

        db.query(query,values).then((result)=>{
            if(result.rowCount>0){
                resolve(result.rows[0]);
            }
            else{
                reject(new CustomError('Table not found',400));
            }
        }).catch((err)=>{
            reject(err);
        });
    });
};

tableModel.getAllTables = () =>{
    return new Promise ((resolve, reject)=>{
        const query = `SELECT * FROM games_tables`;
        db.query(query).then((result)=>{
            if(result.rowCount>0){
                resolve(result.rows);
            }
            else{
                reject( new CustomError("No game tables found",404));
            }
        }).catch((err)=>{
            reject(err);
        });
    });
};


tableModel.createTable = (max_players, small_blind) =>{

    return new Promise((resolve, reject)=>{
        const createTableQuery = `INSERT INTO game_tables (max_players, small_blind) VALUES ($1, $2) RETURNING table_id`;
        const tableValues = [max_players,small_blind];

        db.query(createTableQuery,tableValues).then((tableResult)=>{
            if(tableResult.rowCount ===0){
                throw new CustomError('Failed to create table',500);
            }
            else{
                resolve(tableResult.rows[0].table_id);
            }
        })
        .catch((err)=>{
            reject(new CustomError('Failed to create table', 500));
        });
    });
};



tableModel.getCurrentGame =(table_id)=>{
    return new Promise ((resolve,reject)=>{
        db.query(`SELECT * FROM games WHERE table_id = $1 AND game_status = $2`,[table_id,'ongoing'])
            .then((data)=>{
                if ( data.rowCount>0){
                    resolve(data.rows[0]);
                }
                else{
                    reject( new CustomError('Current game not listed',404));
                }
            })
        }).catch((err)=>{
            reject(new CustomError('Error getting current game', 500));
        });
};

tableModel.getPlayersAtTable = (table_id) =>{

    return new Promise((resolve, reject)=>{

        const query = `SELECT player_id FROM players WHERE table_id = $1`;
        const values = [table_id];

        db.query(query,values).then((result)=>{
            if ( result.rowCount>0){
                resolve(result.rows);
            }
            else{
                reject( new CustomError('No players found at the table',404));
            }
        }).catch(err=>{
            reject(err);
        });
    });
};

tableModel.addPlayerToTable = (table_id, player_id) =>{

    return new Promise ((resolve, reject)=>{

        const query = `UPDATE players SET table_id = $1 WHERE player_id=$2`;
        const values =[table_id,player_id];

        db.query(query,values).then((result)=>{
            if ( result.rowCount >0){
                resolve(true);
            }
            else{
                reject( new CustomError('Player not found',404));
            };
        }).catch(err=>{reject(err)});
    });
};


tableModel.removePlayerFromTable = (table_id, player_id)=>{

    return new Promise ((resolve, reject)=>{

        const query = `Update players SET table_id = NULL where table_id = $1 AND player_id = $2`;
        const values =[table_id,player_id];

        db.query(query,values).then((result)=>{
            if(result.affectedRows >0){
                resolve(true);
            }
            else{
                reject ( new CustomError('Player not found at specified table'));
            }
        }).catch(err=>{reject(err)});
    });
};

module.exports = tableModel;