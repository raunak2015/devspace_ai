const express = require('express');

const { createTask, listTasks, updateTaskStatus, updateTaskDetails, deleteTask } = require('../controllers/taskController');

const router = express.Router();

router.post('/', createTask);
router.get('/:projectId', listTasks);
router.patch('/:taskId/status', updateTaskStatus);
router.patch('/:taskId', updateTaskDetails);
router.delete('/:taskId', deleteTask);

module.exports = router;
