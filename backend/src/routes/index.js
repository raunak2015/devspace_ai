const express = require('express');

const authRoutes = require('./authRoutes');
const projectRoutes = require('./projectRoutes');
const taskRoutes = require('./taskRoutes');
const messageRoutes = require('./messageRoutes');
const aiRoutes = require('./aiRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/messages', messageRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
