const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/MessageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendMessage);
router.get('/:roomId', protect, getMessages);

module.exports = router;