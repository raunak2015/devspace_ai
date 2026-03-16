const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },
        content: {
            type: String,
            default: ''
        },
        language: {
            type: String,
            default: 'javascript'
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        owner: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('File', fileSchema);
