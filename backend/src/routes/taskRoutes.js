const express = require('express');

const { createTask, listTasks } = require('../controllers/taskController');

const router = express.Router();

router.post('/', createTask);
router.get('/:projectId', listTasks);

module.exports = router;
