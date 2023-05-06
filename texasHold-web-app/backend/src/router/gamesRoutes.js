const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const {authMiddleware}  = require('../middleware/auth');

router.get('/list', authMiddleware,gameController.getGameList);

router.post('/create', authMiddleware, gameController.createGame);

/*
Todo  join game router


*/

module.exports = router;
