const gameModel = require("../models/game/gameModel");
const tableModel = require("../models/table/tableModel");
const gameController = {};

gameController.createGame = (req, res) => {
    const result = {};

    const { name, maxPlayers, minBuyIn, maxBuyIn } = req.body;
    console.log(req.body)

    gameModel.createGame(name, maxPlayers, minBuyIn, maxBuyIn)
        .then((game) => {
            result.name = game.name;
            result.id = game.game_id;
            result.startime = game.start_time;
            result.maxPlayers = maxPlayers;
            result.minBuyIn = minBuyIn;
            result.maxBuyIn = maxBuyIn;
            console.log(result)
            res.status(200).json(result);
        })
        .catch((err) => {
            result.error = err.message;
            res.status(500).json(result);
        });
};


gameController.getGameList = (req, res) => {
    const result = {};

    gameModel.getAllGames()
        .then((games) => {
            result.games = games;
            res.status(200).json({result});
        })
        .catch((err) => {
            result.error = err.message;
            res.status(500).json(result);
        
        });
};

/*
TODO  join game controller

*/

module.exports = gameController;
