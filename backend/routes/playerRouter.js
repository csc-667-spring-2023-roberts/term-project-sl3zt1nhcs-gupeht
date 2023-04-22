const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const authMiddleware = require('../middleware/authMiddleware');
const sessionMiddleware = require('../middleware/sessionUser');

router.use(sessionMiddleware.sessionMiddleware);
router.post('/createplayer', authMiddleware.requireAuth, playerController.createPlayer);
router.get('/getplayerbyid/:player_id', authMiddleware.requireAuth, playerController.getPlayerById);
router.put('/updateplayerstatus/:player_id', authMiddleware.requireAuth, playerController.updatePlayerStatus);
router.get('/getplayersbygameid/:game_id', authMiddleware.requireAuth, playerController.getPlayersByGameId);
router.get('/getactiveplayersbygameid/:game_id', authMiddleware.requireAuth, playerController.getActivePlayersByGameId);
router.get('/getplayerbyuseridandgameid/:user_id/:game_id', authMiddleware.requireAuth, playerController.getPlayerByUserIdAndGameId);

module.exports = router;