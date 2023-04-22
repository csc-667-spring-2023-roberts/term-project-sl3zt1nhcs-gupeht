const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');
const sessionMiddleware = require('../middleware/sessionUser');

router.use(sessionMiddleware.sessionMiddleware);
router.get('/lobby', authMiddleware.requireAuth, gameController.getAllGames);
router.post('/gamecreate', authMiddleware.requireAuth, gameController.createGame);
router.post('/gamejoin', authMiddleware.requireAuth, gameController.joinGame);
router.get('/getgamebyid/:game_id', authMiddleware.requireAuth, gameController.getGameById);
router.get('/getgamebyplayer/:player_id', authMiddleware.requireAuth, gameController.getCurrentByPlayerId);
router.delete('/deletegame/:game_id', authMiddleware.requireAuth, gameController.deleteGame);
router.post('/startround/:game_id', authMiddleware.requireAuth, gameController.startNextRound);

module.exports = router;