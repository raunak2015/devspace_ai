const express = require('express');

const { createProject, listProjects, getProjectSummary } = require('../controllers/projectController');

const router = express.Router();

router.post('/', createProject);
router.get('/', listProjects);
router.get('/summary', getProjectSummary);

module.exports = router;
