const express = require('express');

const { createProject, listProjects, getProjectSummary, deleteProject, updateProjectMembers } = require('../controllers/projectController');

const router = express.Router();

router.post('/', createProject);
router.get('/', listProjects);
router.get('/summary', getProjectSummary);
router.patch('/:projectId/members', updateProjectMembers);
router.delete('/:projectId', deleteProject);

module.exports = router;
