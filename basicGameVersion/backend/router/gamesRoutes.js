const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authenticate  = require('../middleware/auth');

// Create a new game
router.post('/game', authenticate, gameController.createGame);

// Load a game
router.get('/game/:gameId', authenticate, gameController.loadGame);

// Update a game
router.put('/game/:gameId', authenticate, gameController.updateGame);

// Add players to a game
router.post('/game/:gameId/players', authenticate, gameController.addPlayersToGame);

// Deal cards in a game
router.put('/game/:gameId/deal', authenticate, gameController.dealCards);

// Handle a betting round in a game
router.put('/game/:gameId/betting-round', authenticate, gameController.handleBettingRound);

// Get table details by game ID
router.get('/game/:gameId/table', authenticate, gameController.getTableByGameId);

// Start a game
router.put('/game/:gameId/start', authenticate, gameController.startGame);

// Get the game state by game ID
router.get('/game/:gameId/state', authenticate, gameController.getGameState);

// Handle a player's action during a betting round
router.post('/game/:gameId/player-action', authenticate, gameController.handlePlayerAction);

// Play a round in a game
router.put('/game/:gameId/play-round', authenticate, gameController.playRound);

module.exports = router;
