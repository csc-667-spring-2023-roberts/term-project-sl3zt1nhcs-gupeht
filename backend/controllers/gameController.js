const gameModel = require('../models/gameModel');

    exports.createGame = (req, res) =>{

        const result = {};

        const { table_id, lobby_id, start_time} = req.body;
    
        gameModel.createGame(table_id,lobby_id,start_time).then( (game_id) =>{
            result.game_id = game_id;
            res.status(200).json({Result:result});
            
        })
        .catch((err) =>{
            result.error = err.message;
            res.status(500).jsont({Result:result});
        });
    
    };

    exports.getGameById= (req,res) =>{

        const {game_id} = req.params;

        const result = {};

        gameModel.getGameById(game_id).then( (game) =>{
            result.game = game;
            res.status(200).json({Result:result});
        })
        .catch((err)=>{
            result.error = err.message;
            res.status(500).json({Result:result});
        });
    };

    exports.deleteGame= (req, res)=>{
        const {game_id} = req.params;
        const result = {};

        gameModel.deleteGame(game_id).then(()=>{
            result.game_id = game_id;
            res.status(200).json({Result:result});
        })
        .catch((err)=>{
            result.error = err.message;
            res.status(500).json({Result:result});
        });

    };

    exports.getAllGames = (req,res)=>{
        const result = {};
        gameModel.getAllGames().then((games)=>{
            result.games = games;
            res.status(200).json({Result:result})
        }).catch((err)=>{
            result.error = err.message;
            res.status(500).json({Result:result});
        });
    };

    exports.getCurrentByPlayerId= (req,res)=>{

        const {player_id} = req.params;
        const result = {};

        gameModel.getCurrentGameByPlayerId(player_id).then((game)=>{
            result.game = game;
            res.status(200).json({Result:result});
        })
        .catch((err)=>{
            result.error = err.message;
            res.status(500).json({Result:result});
        });
    };

    exports.joinGame = (req,res)=>{

        const {user_id, game_id} = req.body;
        const result = {};

        gameModel.joinGame(user_id,game_id).then((player_id)=>{
            result.player_id = player_id;
            res.status(200).json({Result:result});
        })
        .catch((err)=>{
            result.error = err.message;
            res.status(500).json({Result: result});
        })
    }
