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

gameController.joinGame = (req, res) => {
    const result = {};

    const user_id = req.user.id;

    const { gameId } = req.body;

    playerModel.joinGame(user_id, gameId)
        .then((emptySeat) => {
            result.success = true;
            result.seat = emptySeat;
            res.status(200).json(result);
        })
        .catch((err) => {
            result.error = err.message;
            res.status(err.status || 500).json(result);
        });
};


gameController.getGamePage = async (req, res) => {
    const gameId = req.params.game_id;
    const result = {};

    try {
        const game = await gameModel.getGameData(gameId);
        if (game) {
            result.game = game;
            result.success = true;
            res.render("game", { result });
        } else {
            result.success = false;
            result.message = "Game not found.";
            res.render("error", { result });
        }
    } catch (error) {
        result.success = false;
        result.message = "Error retrieving game data.";
        res.render("error", { result });
    }
};

module.exports = gameController;
