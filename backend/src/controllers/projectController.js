const Project = require('../models/Project');

async function createProject(req, res, next) {
    try {
        const { name, owner, members } = req.body;

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
        const projects = await Project.find().sort({ createdAt: -1 });

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
