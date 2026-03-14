const express = require('express');

const { createTask, listTasks, updateTaskStatus } = require('../controllers/taskController');

const router = express.Router();

router.post('/', createTask);
router.get('/:projectId', listTasks);
router.patch('/:taskId/status', updateTaskStatus);

module.exports = router;
