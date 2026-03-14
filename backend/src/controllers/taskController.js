const Task = require('../models/Task');

async function createTask(req, res, next) {
    try {
        const { title, description, status, assignedTo, deadline, projectId } = req.body;

        if (!title || !projectId) {
            res.status(400);
            throw new Error('Task title and projectId are required.');
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

module.exports = {
    createTask,
    listTasks
};
