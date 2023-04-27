const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/register', userController.createUser);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/me', authMiddleware, userController.getCurrentUser);


//front end routes
router.get('/register',(req,res)=>{
    res.render('register');
});

router.get('/login',(req,res)=>{
    res.render('login');
});







module.exports = router;