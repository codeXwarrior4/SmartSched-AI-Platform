const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const auth = require('../middleware/authMiddleware');

router.use(auth);
router.get('/', classController.getAll);
router.post('/', classController.create);
router.put('/:id', classController.update);
router.delete('/:id', classController.delete);

module.exports = router;
