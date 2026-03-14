const Project = require('../models/Project');

async function createProject(req, res, next) {
    try {
        const { name, members } = req.body;
        const owner = req.user?.id;

        if (!name || !owner) {
            res.status(400);
            throw new Error('Project name and owner are required.');
        }

        const project = await Project.create({
            name: String(name).trim(),
            owner: String(owner).trim(),
            members: Array.isArray(members) ? members : []
        });

        res.status(201).json({
            message: 'Project created successfully.',
            project
        });
    } catch (error) {
        next(error);
    }
}

async function listProjects(_req, res, next) {
    try {
        const projects = await Project.find({ owner: _req.user?.id }).sort({ createdAt: -1 });

        res.status(200).json({
            projects
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createProject,
    listProjects
};
