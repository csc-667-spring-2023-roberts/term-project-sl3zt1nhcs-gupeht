const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');
const sessionMiddleware= require ('../middleware/sessionUser');


router.use(sessionMiddleware.sessionMiddleware);
router.get('/lobby',authMiddleware.requireAuth,gameController.getAllGames);
router.post('/game',authMiddleware.requireAuth,gameController.createGame);
router.post('/join',authMiddleware.requireAuth,gameController.joinGame);
router.get('/game/:game_id',authMiddleware.requireAuth,gameController.getGameById);
router.get('./game/current/:player_id',authMiddleware.requireAuth,gameController.getCurrentByPlayerId)
router.delete('/game/:game_id',authMiddleware.requireAuth,gameController.deleteGame);

module.exports = router;
