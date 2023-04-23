const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/register', userController.createUser);
router.post('/login', userController.login);
router.post('/logout', authMiddleware, userController.logout);
router.get('/me', authMiddleware, userController.getCurrentUser);

module.exports = router;