const Project = require('../models/Project');
const Task = require('../models/Task');
const Message = require('../models/Message');

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

async function getProjectSummary(req, res, next) {
    try {
        const ownerId = req.user?.id;
        const projects = await Project.find({ owner: ownerId }).select('_id');
        const projectIds = projects.map((project) => String(project._id));

        const totalProjects = projectIds.length;

        if (totalProjects === 0) {
            return res.status(200).json({
                summary: {
                    totalProjects: 0,
                    totalTasks: 0,
                    completedTasks: 0,
                    pendingTasks: 0
                }
            });
        }

        const [totalTasks, completedTasks] = await Promise.all([
            Task.countDocuments({ projectId: { $in: projectIds } }),
            Task.countDocuments({ projectId: { $in: projectIds }, status: 'Completed' })
        ]);

        res.status(200).json({
            summary: {
                totalProjects,
                totalTasks,
                completedTasks,
                pendingTasks: Math.max(totalTasks - completedTasks, 0)
            }
        });
    } catch (error) {
        next(error);
    }
}

async function deleteProject(req, res, next) {
    try {
        const { projectId } = req.params;

        const project = await Project.findOne({ _id: projectId, owner: req.user?.id });
        if (!project) {
            res.status(404);
            throw new Error('Project not found.');
        }

        await Promise.all([
            Task.deleteMany({ projectId: String(project._id) }),
            Message.deleteMany({ projectId: String(project._id) }),
            Project.deleteOne({ _id: project._id })
        ]);

        res.status(200).json({
            message: 'Project deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createProject,
    listProjects,
    getProjectSummary,
    deleteProject
};
