const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const {authenticate} = require ('../middleware/auth.js');

router.post('/',authenticate ,gameController.createGame);
router.post('/:gameId/players',authenticate ,gameController.addPlayersToGame);
router.get('/:gameId/players',authenticate ,gameController.getPlayersByGameId);
router.post('/:gameId/deal',authenticate ,gameController.dealCards);
router.get('/:gameId/community-cards',authenticate ,gameController.getCommunityCardsByGameId);
router.post('/:gameId/community-cards',authenticate ,gameController.addCommunityCardToGame);
router.get('/:gameId/pot',authenticate ,gameController.getPotByGameId);
router.post('/:gameId/bets',authenticate ,gameController.placeBet);
router.post('/:gameId/betting-round',authenticate ,gameController.handleBettingRound);
router.post('/:gameId/handle-game',authenticate ,gameController.handleGame);

module.exports = router;