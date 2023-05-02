const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authenticate  = require('../middleware/auth');



// Create a new game
router.post('/create', authenticate, gameController.createGame);



module.exports = router;
