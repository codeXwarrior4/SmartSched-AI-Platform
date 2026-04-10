const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const auth = require('../middleware/authMiddleware');

router.use(auth);
router.get('/', timetableController.getTimetable);
router.post('/generate', timetableController.generate);
router.delete('/clear', timetableController.clear);

module.exports = router;
