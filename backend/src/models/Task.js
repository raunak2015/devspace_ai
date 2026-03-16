const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 160
        },
        description: {
            type: String,
            trim: true,
            default: ''
        },
        status: {
            type: String,
            enum: ['To Do', 'In Progress', 'Completed'],
            default: 'To Do'
        },
        assignedTo: {
            type: String,
            trim: true,
            default: ''
        },
        deadline: {
            type: Date,
            default: null
        },
        projectId: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Task', taskSchema);
