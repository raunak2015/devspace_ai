const Message = require('../models/Message');

async function createMessage(req, res, next) {
    try {
        const { projectId, sender, message } = req.body;

        if (!projectId || !sender || !message) {
            res.status(400);
            throw new Error('projectId, sender, and message are required.');
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

module.exports = {
    createMessage,
    listMessages
};
