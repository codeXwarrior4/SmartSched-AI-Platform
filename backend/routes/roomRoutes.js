const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const auth = require('../middleware/authMiddleware');

router.use(auth);
router.get('/', roomController.getAll);
router.post('/', roomController.create);
router.put('/:id', roomController.update);
router.delete('/:id', roomController.delete);

module.exports = router;
