const express = require('express');
const router = express.Router();
const lobbyController = require('../controllers/lobbyController');
const authMiddleware = require('../middleware/authMiddleware');
const sessionMiddleware = require('../middleware/sessionUser');


router.use(sessionMiddleware.sessionMiddleware);
router.post('/create-lobby', authMiddleware.requireAuth, lobbyController.createLobby);
router.post('/add-player-to-lobby', authMiddleware.requireAuth, lobbyController.addPlayerToLobby);
router.post('/start-game-in-lobby', authMiddleware.requireAuth, lobbyController.startGameInLobby);
router.get('/get-lobby-by-id/:lobby_id', authMiddleware.requireAuth, lobbyController.getLobbyById);