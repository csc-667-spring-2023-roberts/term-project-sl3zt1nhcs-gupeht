const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const {authMiddleware}  = require('../middleware/auth');

/*
// Create a new game
router.post('/create', authMiddleware, gameController.createGame);

// Join a game
router.post('/join/:gameId', authMiddleware, gameController.joinGame);

// Get a list of all games
router.get('/list', gameController.getGameList);

// Add a player to a game
router.post('/add-player/:gameId', authMiddleware, gameController.addPlayersToGame);

// Remove a player from a game
router.post('/remove-player/:gameId', authenticate, gameController.removePlayerFromGame);

// Play a round of poker
router.post('/play-round/:gameId', authenticate, gameController.playRound);

*/

module.exports = router;
