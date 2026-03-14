const express = require('express');

const { createProject, listProjects, getProjectSummary, deleteProject } = require('../controllers/projectController');

const router = express.Router();

router.post('/', createProject);
router.get('/', listProjects);
router.get('/summary', getProjectSummary);
router.delete('/:projectId', deleteProject);

module.exports = router;
