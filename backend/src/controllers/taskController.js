const Task = require('../models/Task');
const Project = require('../models/Project');

function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}

function escapeRegExp(text) {
    return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getProjectAccessFilter(projectId, user) {
    const ownerId = String(user?.id || '').trim();
    const email = normalizeEmail(user?.email);

    if (!ownerId) {
        return { _id: null };
    }

    if (!email) {
        return { _id: projectId, owner: ownerId };
    }

    return {
        _id: projectId,
        $or: [
            { owner: ownerId },
            { members: { $regex: `^${escapeRegExp(email)}$`, $options: 'i' } }
        ]
    };
}

async function createTask(req, res, next) {
    try {
        const { title, description, status, assignedTo, deadline, projectId } = req.body;

        if (!title || !projectId) {
            res.status(400);
            throw new Error('Task title and projectId are required.');
        }

        const project = await Project.findOne(getProjectAccessFilter(projectId, req.user));
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
        const rawQuery = String(req.query.q || '').trim();

        const project = await Project.findOne(getProjectAccessFilter(projectId, req.user));
        if (!project) {
            res.status(403);
            throw new Error('You are not allowed to view tasks for this project.');
        }

        const filter = { projectId };

        if (rawQuery) {
            const regex = new RegExp(rawQuery, 'i');
            filter.$or = [
                { title: regex },
                { description: regex },
                { assignedTo: regex }
            ];
        }

        const [tasks, total] = await Promise.all([
            Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Task.countDocuments(filter)
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

        const project = await Project.findOne(getProjectAccessFilter(task.projectId, req.user));
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

async function updateTaskDetails(req, res, next) {
    try {
        const { taskId } = req.params;
        const { title, description, assignedTo, deadline } = req.body;

        const task = await Task.findById(taskId);
        if (!task) {
            res.status(404);
            throw new Error('Task not found.');
        }

        const project = await Project.findOne(getProjectAccessFilter(task.projectId, req.user));
        if (!project) {
            res.status(403);
            throw new Error('You are not allowed to update tasks for this project.');
        }

        if (title !== undefined) {
            const trimmedTitle = String(title).trim();
            if (!trimmedTitle) {
                res.status(400);
                throw new Error('Task title cannot be empty.');
            }
            task.title = trimmedTitle;
        }

        if (description !== undefined) {
            task.description = description ? String(description).trim() : '';
        }

        if (assignedTo !== undefined) {
            task.assignedTo = assignedTo ? String(assignedTo).trim() : '';
        }

        if (deadline !== undefined) {
            if (!deadline) {
                task.deadline = null;
            } else {
                const parsedDate = new Date(deadline);
                if (Number.isNaN(parsedDate.getTime())) {
                    res.status(400);
                    throw new Error('Invalid deadline date.');
                }
                task.deadline = parsedDate;
            }
        }

        await task.save();

        res.status(200).json({
            message: 'Task updated successfully.',
            task
        });
    } catch (error) {
        next(error);
    }
}

async function deleteTask(req, res, next) {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);
        if (!task) {
            res.status(404);
            throw new Error('Task not found.');
        }

        const project = await Project.findOne(getProjectAccessFilter(task.projectId, req.user));
        if (!project) {
            res.status(403);
            throw new Error('You are not allowed to delete tasks for this project.');
        }

        await Task.deleteOne({ _id: taskId });

        res.status(200).json({
            message: 'Task deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createTask,
    listTasks,
    updateTaskStatus,
    updateTaskDetails,
    deleteTask
};
