const express = require('express');

const { createTask, listTasks, updateTaskStatus, deleteTask } = require('../controllers/taskController');

const router = express.Router();

router.post('/', createTask);
router.get('/:projectId', listTasks);
router.patch('/:taskId/status', updateTaskStatus);
router.delete('/:taskId', deleteTask);

module.exports = router;
