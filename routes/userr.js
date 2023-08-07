const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userc');

router.post('/auth/signup', userCtrl.signup);

module.exports = router;
