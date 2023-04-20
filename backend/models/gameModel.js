const db  = require ('../database/db');
const {CustomError} = require('../middleware/customErrorHandler');

const gameModel ={};

gameModel.createGame = (table_id, start_time) =>{

    return new Promise (( resolve , reject ) =>{

        const query = `INSERT INTO games (table_id, start_time) VALUES ($1, $2) RETURNING game_id`;
        const values = [table_id,start_time];

        db.query(query,values).then(result=>{

            if ( result.rowCount > 0 ){
                resolve(result.rows[0].game_id);
            }
            else{
                reject( new CustomError("No rows affected",404));
            }  
        })
        .catch (err=>{
            reject(err);
        });
    });
};


gameModel.getGameById = (game_id) =>{

    return new Promise( (resolve, reject)=>{

        const query = `SELECT * FROM games WHERE game_id = $1`;

        return db.query(query,[game_id]).then( result=>{
            if ( result.rowCount > 0){
                resolve(result.rows[0]);
            }
            else{
                reject( new CustomError("Game ID does not exist",400));
            }
        })
        .catch(err =>{
            reject(err);
        });

    });

};


gameModel.updateGame = ( game_id, end_time, winner_id, is_done) =>{

    return new Promise (( resolve, reject)=>{

        const query = `UPDATE games SET end_time = $1, winner_id = $2, is_done = $3 WHERE game_id = $4`;
        const values = [end_time,winner_id,is_done,game_id];


        db.query(query,values).then( result =>{
            if ( result.rows.length > 0){
                resolve(result.rows[0]);
            }
            else{
                 reject( new CustomError("No updates affected", 400));
            }
        }).catch(err =>{
            reject(err);
        });

    });
 
};


gameModel.deleteGame = ( game_id) =>{

    return new Promise (( resolve, reject)=>{

        const query = `DELETE FROM games WHERE game_id = $1`;
        const values= [game_id];

        db.query(query,values).then(result=>{
            if ( result.rowCount >0){
                resolve(true);
            }
            else{
                reject( new CustomError('No rows were deleted',404));
            }
        }).catch(err=>{
            reject(err);
        });
    });
};


gameModel.getAllGames = () =>{

    return new Promise ((resolve, reject) =>{
        const query=`SELECT * FROM game`;

        db.query(query).then(result =>{

            if (result.rows.length > 0 ){
                resolve(result.rows);
            }
            else{
                reject( new CustomError("No game found",404));
            }

        }).catch(err =>{
            reject(err);
        });
    });
};

gameModel.getCurrentGameByPlayerId = (player_id) =>{
    return new Promise((resolve, reject)=>{
        const query = `SELECT * FROM games WHERE game_id IN (SELECT game_id FROM players WHERE player_id = $1)`;
        db.query(query, [player_id]).then((result)=>{
            if (result.rows.length >0){
                resolve(result.rows[0]);
            }
            else{
                reject(new CustomError(`No game found with player_id ${player_id}`,404));
            }
        }).catch(err=>{
            reject(err);
        });
    });
};


gameModel.joinGame = (user_id,game_id) =>{

    return new Promise ((resolve, reject)=>{

        const query = `INSERT INTO players (user_id, game_id) VALUES ($1. $2) RETURNING player_id`;
        const values = [user_id,game_id];

        db.query(query,values).then((result)=>{
            if ( result.rowCount > 0){
                resolve ( result.rows[0].player_id);
            }
            else{
                reject(new CustomError(`Player ${user_id} could not join game`,404))
            }
        })
    })
    .catch((err)=>{
        reject(err);
    });
};



module.exports = gameModel;