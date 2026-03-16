const express = require('express');

const authRoutes = require('./authRoutes');
const projectRoutes = require('./projectRoutes');
const taskRoutes = require('./taskRoutes');
const messageRoutes = require('./messageRoutes');
const aiRoutes = require('./aiRoutes');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/projects', authenticate, projectRoutes);
router.use('/tasks', authenticate, taskRoutes);
router.use('/messages', authenticate, messageRoutes);
router.use('/ai', authenticate, aiRoutes);

module.exports = router;
