const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/seed', authController.seedAdmin);
router.post('/login', authController.login);

module.exports = router;
