const express = require('express');

const { createProject, listProjects } = require('../controllers/projectController');

const router = express.Router();

router.post('/', createProject);
router.get('/', listProjects);

module.exports = router;
