const express = require('express');

const authRoutes = require('./authRoutes');
const projectRoutes = require('./projectRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);

module.exports = router;
