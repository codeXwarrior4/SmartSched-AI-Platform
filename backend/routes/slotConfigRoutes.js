const express = require('express');
const router = express.Router();
const slotConfigController = require('../controllers/slotConfigController');
const auth = require('../middleware/authMiddleware');

router.use(auth);
router.get('/', slotConfigController.getConfig);
router.put('/', slotConfigController.updateConfig);

module.exports = router;
