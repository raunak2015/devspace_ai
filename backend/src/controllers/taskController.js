const Task = require('../models/Task');
const Project = require('../models/Project');

async function createTask(req, res, next) {
    try {
        const { title, description, status, assignedTo, deadline, projectId } = req.body;

        if (!title || !projectId) {
            res.status(400);
            throw new Error('Task title and projectId are required.');
        }

        const project = await Project.findOne({ _id: projectId, owner: req.user?.id });
        if (!project) {
            res.status(403);
            throw new Error('You are not allowed to add tasks to this project.');
        }

        const task = await Task.create({
            title: String(title).trim(),
            description: description ? String(description).trim() : '',
            status: status || 'To Do',
            assignedTo: assignedTo ? String(assignedTo).trim() : '',
            deadline: deadline ? new Date(deadline) : null,
            projectId: String(projectId).trim()
        });

        res.status(201).json({
            message: 'Task created successfully.',
            task
        });
    } catch (error) {
        next(error);
    }
}

async function listTasks(req, res, next) {
    try {
        const { projectId } = req.params;
        const page = Number.parseInt(req.query.page, 10) || 1;
        const limit = Number.parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const project = await Project.findOne({ _id: projectId, owner: req.user?.id });
        if (!project) {
            res.status(403);
            throw new Error('You are not allowed to view tasks for this project.');
        }

        const [tasks, total] = await Promise.all([
            Task.find({ projectId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Task.countDocuments({ projectId })
        ]);

        res.status(200).json({
            tasks,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
}

async function updateTaskStatus(req, res, next) {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        if (!status) {
            res.status(400);
            throw new Error('Task status is required.');
        }

        if (!['To Do', 'In Progress', 'Completed'].includes(status)) {
            res.status(400);
            throw new Error('Invalid task status.');
        }

        const task = await Task.findById(taskId);
        if (!task) {
            res.status(404);
            throw new Error('Task not found.');
        }

        const project = await Project.findOne({ _id: task.projectId, owner: req.user?.id });
        if (!project) {
            res.status(403);
            throw new Error('You are not allowed to update tasks for this project.');
        }

        task.status = status;
        await task.save();

        res.status(200).json({
            message: 'Task status updated successfully.',
            task
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createTask,
    listTasks,
    updateTaskStatus
};
