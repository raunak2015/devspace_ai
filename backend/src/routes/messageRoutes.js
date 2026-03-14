const express = require('express');

const { createMessage, listMessages, deleteMessage } = require('../controllers/messageController');

const router = express.Router();

router.post('/', createMessage);
router.get('/:projectId', listMessages);
router.delete('/:messageId', deleteMessage);

module.exports = router;
