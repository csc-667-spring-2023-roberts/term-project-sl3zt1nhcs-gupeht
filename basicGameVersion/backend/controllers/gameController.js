const gameModel = require("../models/game/gameModel");
const tableModel = require("../models/table/tableModel");
const gameController = {};

gameController.createGame = async (req, res, next) => {
    try {
        const { tableName, maxPlayers, minBuyIn, maxBuyIn } = req.body;
        const tableId = await tableModel.createTable(tableName, maxPlayers, minBuyIn, maxBuyIn);
        const gameId = await gameModel.createGame(tableId);
        res.status(201).json({ gameId });
    } catch (err) {
        next(err);
    }
};

gameController.loadGame = async (req, res, next) => {
    try {
        const { gameId } = req.params;
        const pokerGame = await gameModel.loadGame(gameId);
        res.status(200).json(pokerGame);
    } catch (err) {
        next(err);
    }
};

gameController.updateGame = async (req, res, next) => {
    try {
        const { gameId } = req.params;
        const { pokerGame } = req.body;
        await gameModel.updateGame(gameId, pokerGame);
        res.status(200).json({ success: true, message: "Game updated" });
    } catch (err) {
        next(err);
    }
};

gameController.addPlayersToGame = async (req, res, next) => {
    try {
        const { gameId, playerIds } = req.body;
        await gameModel.addPlayersToGame(gameId, playerIds);
        res.status(200).json({ success: true, message: "Players added to game" });
    } catch (err) {
        next(err);
    }
};

gameController.removePlayerFromGame = async (req, res, next) => {
    try {
        const { gameId, playerId } = req.body;
        await gameModel.removePlayerFromGame(gameId, playerId);
        res.status(200).json({ success: true, message: "Player removed from game" });
    } catch (err) {
        next(err);
    }
};

gameController.getTableByGameId = async (req, res, next) => {
    try {
        const { gameId } = req.params;
        const tableId = await gameModel.getTableIdByGameId(gameId);
        const table = await tableModel.getTableById(tableId);
        res.status(200).json(table);
    } catch (err) {
        next(err);
    }
};

gameController.getGameState = async (req, res, next) => {
    try {
        const { gameId } = req.params;
        const pokerGame = await gameModel.loadGame(gameId);
        res.status(200).json(pokerGame.getState());
    } catch (err) {
        next(err);
    }
};

gameController.handlePlayerAction = async (req, res, next) => {
    try {
        const { gameId } = req.params;
        const { playerId, action, amount } = req.body;
        const pokerGame = await gameModel.loadGame(gameId);
        pokerGame.handlePlayerAction(playerId, action, amount);
        await gameModel.updateGame(gameId, pokerGame);
        res.status(200).json({ success: true, message: "Player action handled" });
    } catch (err) {
        next(err);
    }
};

gameController.playRound = async (req, res, next) => {
    try {
        const { gameId } = req.params;
        const pokerGame = await gameModel.loadGame(gameId);
        pokerGame.playRound();
        await gameModel.updateGame(gameId, pokerGame);
        res.status(200).json({ success: true, message: "Round played" });
    } catch (err) {
        next(err);
    }
};

module.exports = gameController;
