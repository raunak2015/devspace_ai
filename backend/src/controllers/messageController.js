const Message = require('../models/Message');
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

async function createMessage(req, res, next) {
    try {
        const { projectId, message } = req.body;
        const sender = req.user?.name || req.user?.email;

        if (!projectId || !sender || !message) {
            res.status(400);
            throw new Error('projectId, sender, and message are required.');
        }

        const project = await Project.findOne(getProjectAccessFilter(projectId, req.user));
        if (!project) {
            res.status(403);
            throw new Error('You are not allowed to post messages in this project.');
        }

        const created = await Message.create({
            projectId: String(projectId).trim(),
            sender: String(sender).trim(),
            message: String(message).trim()
        });

        res.status(201).json({
            message: 'Message sent successfully.',
            data: created
        });
    } catch (error) {
        next(error);
    }
}

async function listMessages(req, res, next) {
    try {
        const { projectId } = req.params;
        const page = Number.parseInt(req.query.page, 10) || 1;
        const limit = Number.parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        const project = await Project.findOne(getProjectAccessFilter(projectId, req.user));
        if (!project) {
            res.status(403);
            throw new Error('You are not allowed to view messages for this project.');
        }

        const [messages, total] = await Promise.all([
            Message.find({ projectId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Message.countDocuments({ projectId })
        ]);

        res.status(200).json({
            messages,
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

async function deleteMessage(req, res, next) {
    try {
        const { messageId } = req.params;
        const currentSender = String(req.user?.name || req.user?.email || '').trim();

        const message = await Message.findById(messageId);
        if (!message) {
            res.status(404);
            throw new Error('Message not found.');
        }

        const project = await Project.findOne(getProjectAccessFilter(message.projectId, req.user));
        if (!project) {
            res.status(403);
            throw new Error('You are not allowed to delete messages for this project.');
        }

        if (!currentSender || String(message.sender).trim() !== currentSender) {
            res.status(403);
            throw new Error('You can only delete your own messages.');
        }

        await Message.deleteOne({ _id: messageId });

        res.status(200).json({
            message: 'Message deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createMessage,
    listMessages,
    deleteMessage
};
