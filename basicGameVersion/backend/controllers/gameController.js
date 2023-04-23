const gameModel = require('../models/gameModel');
const gameController = {};
const tableModel = require('../controllers/tableController');

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
    res.status(200).json({ success: true, message: 'Game updated' });
  } catch (err) {
    next(err);
  }
};

gameController.addPlayersToGame = async (req, res, next) => {
  try {
    const { gameId, playerIds } = req.body;
    await gameModel.addPlayersToGame(gameId, playerIds);
    res.status(200).json({ success: true, message: 'Players added to game' });
  } catch (err) {
    next(err);
  }
};

gameController.dealCards = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    await gameModel.dealCards(gameId);
    res.status(200).json({ success: true, message: 'Cards dealt' });
  } catch (err) {
    next(err);
  }
};


gameController.handleBettingRound = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    await gameModel.handleBettingRound(gameId);
    res.status(200).json({ success: true, message: 'Betting round handled' });
  } catch (err) {
    next(err);
  }
};

// This function gets the table details of a game
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


// This function starts a game, deals cards, and initiates the first betting round
gameController.startGame = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    await gameModel.dealCards(gameId);
    await gameModel.handleBettingRound(gameId);
    res.status(200).json({ success: true, message: 'Game started' });
  } catch (err) {
    next(err);
  }
};

// This function retrieves the current state of the game (e.g., players, community cards, pot, etc.)
gameController.getGameState = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const pokerGame = await gameModel.loadGame(gameId);
    res.status(200).json(pokerGame.getState());
  } catch (err) {
    next(err);
  }
};

// This function handles a player's action (e.g., fold, call, raise) during a betting round
gameController.handlePlayerAction = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { playerId, action, amount } = req.body;
    const pokerGame = await gameModel.loadGame(gameId);
    pokerGame.handlePlayerAction(playerId, action, amount);
    await gameModel.updateGame(gameId, pokerGame);
    res.status(200).json({ success: true, message: 'Player action handled' });
  } catch (err) {
    next(err);
  }
};

module.exports = gameController;