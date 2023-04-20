const tableModel = require('../models/tableModel');
const {CustomError}= require('../middleware/customErrorHandler');

exports.getPlayersAtTable= (req,res)=>{

    const {table_id} = req.params;

    tableModel.getPlayersAtTable(table_id).then((result)=>{
        res.status(200).json({players:result});
    })
    .catch(err=>{
        res.status(500).json({error:err.message});
    });

};

exports.addPlayerToTable = (req,res)=>{

    const {table_id, player_id} = req.params;

    tableModel.addPlayerToTable(table_id,player_id).then((result)=>{
        res.status(200).json({table:table_id,player:player_id});
    })
    .catch((err)=>{
        res.status(500).json({error:err.message});
    });

}