const gameModel = require('../models/gameModel');


    exports.createGame = (req, res) =>{

        const { table_id, lobby_id, start_time} = req.body;
    
        gameModel.createGame(table_id,lobby_id,start_time).then( game_id =>{
            res.status(200).json({game_id:game_id});
        })
        .catch(err =>{
            res.status(500).json({error:err.message});
        });
    
    };

    exports.getGameById= (req,res) =>{

        const {game_id} = req.params;

        gameModel.getGameById(game_id).then( game =>{
            res.status(200).json({game:game});
        })
        .catch(err=>{
            res.status(500).json({error:err.message});
        });
    };

    exports.deleteGame= (req, res)=>{
        const {game_id} = req.params;

        gameModel.deleteGame(game_id).then(()=>{
            res.status(200).json({message:'Game deleted successfully'})
        })
        .catch(err=>{
            res.status(500).json({error:err.message});
        });

    };

    exports.getAllGames = (req,res)=>{
        gameModel.getAllGames().then(games=>{
            res.status(200).json({game:games})
        }).catch(err=>{
            res.status(500).json({error:err.message});
        });
    };
