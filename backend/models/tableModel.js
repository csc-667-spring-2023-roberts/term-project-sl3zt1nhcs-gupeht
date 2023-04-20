const db = require('../database/db');
const {CustomError} = require('../middleware/customErrorHandler');

const tableModel={};

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