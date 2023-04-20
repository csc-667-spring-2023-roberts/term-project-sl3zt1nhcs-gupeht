const db  = require ('../database/db');
const {CustomError} = require('../middleware/customErrorHandler');
const playerModel ={};


playerModel.addChips = (player_id, chips) =>{

    return new Promise ((resolve, reject)=>{

       const query = `UPDATE player SET chips = chips + $1 WHERE player_id = $2 RETURNING chips`;
       const values = [chips,player_id];

       db.query(query,values).then((result)=>{
        if ( result.rowCount > 0){resolve(result.rows[0].chips);}
        else{reject( new CustomError('Player not found',404)); }
       }).catch( err =>{ reject(err); });
    });
};

playerModel.updateStatus = ( player_id, status) =>{

    return new Promise ((resolve, reject)=>{

        const query =  `UPDATE players SET status = $1 WHERE player_id = $2`;
        const values = [status,player_id];

        db.query(query,values).then((result)=>{
            if ( result.rowCount > 0){
                resolve(true);
            }
            else{
                reject( new CustomError('Player not found',404));
            }
        }).catch(err=>{
            reject(err);
        });
    });
};