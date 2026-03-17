const express = require('express');

const { 
    createProject, 
    listProjects, 
    getProjectSummary, 
    deleteProject, 
    updateProjectMembers,
    inviteMember,
    acceptInvitation
} = require('../controllers/projectController');

const router = express.Router();

router.post('/', createProject);
router.get('/', listProjects);
router.get('/summary', getProjectSummary);
router.patch('/:projectId/members', updateProjectMembers);
router.delete('/:projectId', deleteProject);

// Invitation routes
router.post('/:projectId/invite', inviteMember);
router.post('/accept-invitation', acceptInvitation);

module.exports = router;
