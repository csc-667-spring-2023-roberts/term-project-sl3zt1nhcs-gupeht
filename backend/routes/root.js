const express = require('express');
const router = express.Router();
const rootController = require('../controllers/rootControler');

router.get('/home',rootController.getHome);

module.exports = router