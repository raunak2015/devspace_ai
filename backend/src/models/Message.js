const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        projectId: {
            type: String,
            required: true,
            trim: true
        },
        sender: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Message', messageSchema);
