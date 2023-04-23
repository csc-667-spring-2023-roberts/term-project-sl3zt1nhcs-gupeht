const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const {authenticate} = require ('../middleware/auth.js');


// Create a new game
router.post('/game',authenticate ,gameController.createGame);

// Add players to a game
router.post('/game/:gameId/players',authenticate ,gameController.addPlayersToGame);

// Get players by game ID
router.get('/game/:gameId/players',authenticate ,gameController.getPlayersByGameId);

// Deal cards in a game
router.put('/game/:gameId/deal',authenticate ,gameController.dealCards);

// Get community cards by game ID
router.get('/game/:gameId/community-cards',authenticate ,gameController.getCommunityCardsByGameId);

// Add a community card to a game
router.post('/game/:gameId/community-card',authenticate ,gameController.addCommunityCardToGame);

// Get pot amount by game ID
router.get('/game/:gameId/pot',authenticate ,gameController.getPotByGameId);

// Place a bet in a game
router.post('/game/:gameId/bet', authenticate,gameController.placeBet);

// Handle a game (process the winner)
router.put('/game/:gameId/handle',authenticate ,gameController.handleGame);

// Get table details by game ID
router.get('/game/:gameId/table',authenticate ,gameController.getTableByGameId);

// Start a game
router.put('/game/:gameId/start',authenticate ,gameController.startGame);

// Get the game state by game ID
router.get('/game/:gameId/state', authenticate,gameController.getGameState);

// Handle a player's action during a betting round
router.post('/game/:gameId/player-action', authenticate,gameController.handlePlayerAction);


module.exports = router;