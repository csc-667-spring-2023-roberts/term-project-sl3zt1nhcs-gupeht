const tableModel = require('../models/tableModel');
const {CustomError}= require('../middleware/customErrorHandler');

exports.getPlayersAtTable= (req,res)=>{

    const {table_id} = req.params;
    const result = {};

    tableModel.getPlayersAtTable(table_id).then((data)=>{

        if ( data.length === 0){
            result.message = " No players found at table"
        }
        else{
            result.players = data;
            res.status(200).json({Result: result});
        }
    })
    .catch((err=>{
        result.error="Internal server error";
        res.status(500).json({Result:result});
    }));

};

exports.addPlayerToTable = (req,res)=>{

    const {table_id, player_id} = req.params;
    const result = {};

    tableModel.addPlayerToTable(table_id,player_id).then((data)=>{

        if ( data.affectedRows === 0){
            result.error = "Could not add player to table";
            res.status(400).json({Result:result});
        }
        else{
            result.message = "Player added to table successfully";
            result.table = table_id;
            result.player = player_id;
            res.status(200).json({Result:result});
        }
    })
    .catch((err)=>{
        if (err.code == "ER_DUP_ENTRY"){
            result.error = "Player already added to table";
            res.status(400).json({Result:result});
        }
        else{
            result.error = "Internal server error";
            res.status(500).json({Result:result});
        }
       
    });

};