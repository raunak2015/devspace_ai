const File = require('../models/File');
const Project = require('../models/Project');

exports.createFile = async (req, res) => {
    try {
        const { name, content, language, projectId } = req.body;
        const owner = req.user.email || req.user.id;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const isMember = project.owner === String(req.user.id) || project.owner === req.user.email || (project.members && project.members.includes(req.user.email));
        if (!isMember) {
            return res.status(403).json({ message: 'Access denied: You are not a member of this project.' });
        }

        const newFile = await File.create({
            name,
            content: content || '',
            language: language || 'plaintext',
            projectId,
            owner
        });

        res.status(201).json({ message: 'File created successfully', file: newFile });
    } catch (error) {
        console.error('Create file error:', error);
        res.status(500).json({ message: 'Server error creating file', error: error.message });
    }
};

exports.getProjectFiles = async (req, res) => {
    try {
        const { projectId } = req.params;
        const owner = req.user.email || req.user.id;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const isMember = project.owner === String(req.user.id) || project.owner === req.user.email || (project.members && project.members.includes(req.user.email));
        if (!isMember) {
            return res.status(403).json({ message: 'Access denied: You are not a member of this project.' });
        }

        const files = await File.find({ projectId }).sort({ createdAt: -1 });

        res.status(200).json({ files });
    } catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({ message: 'Server error retrieving files', error: error.message });
    }
};

exports.updateFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { name, content, language } = req.body;
        const owner = req.user.email || req.user.id;

        const file = await File.findById(fileId);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        const project = await Project.findById(file.projectId);
        if(!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const isMember = project.owner === String(req.user.id) || project.owner === req.user.email || (project.members && project.members.includes(req.user.email));
        if (!isMember) {
            return res.status(403).json({ message: 'Access denied: You are not a member of this project.' });
        }

        if (name) file.name = name;
        if (content !== undefined) file.content = content;
        if (language) file.language = language;

        await file.save();

        res.status(200).json({ message: 'File updated successfully', file });
    } catch (error) {
        console.error('Update file error:', error);
        res.status(500).json({ message: 'Server error updating file', error: error.message });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const owner = req.user.email || req.user.id;

        const file = await File.findById(fileId);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        const project = await Project.findById(file.projectId);
        if(!project) {
             return res.status(404).json({ message: 'Project not found' });
        }

        const isMember = project.owner === String(req.user.id) || project.owner === req.user.email || (project.members && project.members.includes(req.user.email));
        if (!isMember) {
            return res.status(403).json({ message: 'Access denied: You are not a member of this project.' });
        }

        await File.findByIdAndDelete(fileId);

        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({ message: 'Server error deleting file', error: error.message });
    }
};
