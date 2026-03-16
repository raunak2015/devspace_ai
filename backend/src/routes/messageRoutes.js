const express = require('express');

const { createMessage, listMessages } = require('../controllers/messageController');

const router = express.Router();

router.post('/', createMessage);
router.get('/:projectId', listMessages);

module.exports = router;
