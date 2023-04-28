const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// User routes
router.post('/register', userController.createUser);
router.post('/login', userController.login);
router.post('/logout', authMiddleware, userController.logout); // Add authMiddleware to protect the logout route
router.get('/me', authMiddleware, userController.getCurrentUser);

// Front-end routes
router.get('/register', (req, res) => {
  res.render('index');
});

router.get('/login', (req, res) => {
  res.render('index');
});

module.exports = router;






module.exports = router;