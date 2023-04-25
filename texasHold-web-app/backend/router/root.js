
const express = require('express');
const router = express.Router();
const rootControlelr = require('../controllers/root')


router.get('/main',rootControlelr.main );



module.exports = router;