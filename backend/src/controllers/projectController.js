const Project = require('../models/Project');
const Task = require('../models/Task');
const Message = require('../models/Message');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const crypto = require('crypto');
const { sendInvitationEmail } = require('../services/emailService');

function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}

function sanitizeMembers(members) {
    return [...new Set((members || []).map((member) => normalizeEmail(member)).filter(Boolean))];
}

function escapeRegExp(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getAccessibleProjectFilter(user) {
    const ownerId = String(user?.id || '').trim();
    const userEmail = normalizeEmail(user?.email);

    if (!ownerId) {
        return { _id: null };
    }

    if (!userEmail) {
        return { owner: ownerId };
    }

    return {
        $or: [
            { owner: ownerId },
            { members: { $regex: `^${escapeRegExp(userEmail)}$`, $options: 'i' } }
        ]
    };
}

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
            members: sanitizeMembers(Array.isArray(members) ? members : [])
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
        const filter = getAccessibleProjectFilter(_req.user);
        const projects = await Project.find(filter).sort({ createdAt: -1 });

        const ownerIds = [...new Set(projects.map((project) => String(project.owner || '')).filter(Boolean))];
        const owners = await User.find({ _id: { $in: ownerIds } }).select('_id name email');
        const ownerById = new Map(owners.map((owner) => [String(owner._id), owner]));

        const enrichedProjects = projects.map((project) => {
            const rawProject = project.toObject();
            const owner = ownerById.get(String(project.owner || ''));

            return {
                ...rawProject,
                ownerName: owner?.name || '',
                ownerEmail: owner?.email || ''
            };
        });

        res.status(200).json({
            projects: enrichedProjects
        });
    } catch (error) {
        next(error);
    }
}

async function getProjectSummary(req, res, next) {
    try {
        const filter = getAccessibleProjectFilter(req.user);
        const projects = await Project.find(filter).select('_id');
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

async function inviteMember(req, res, next) {
    try {
        const { projectId } = req.params;
        const { email } = req.body;
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail) {
            res.status(400);
            throw new Error('Email is required.');
        }

        const project = await Project.findOne({ _id: projectId, owner: req.user?.id });
        if (!project) {
            res.status(404);
            throw new Error('Project not found or you are not the owner.');
        }

        // Check if already a member
        if (project.members.includes(normalizedEmail)) {
            res.status(400);
            throw new Error('User is already a member of this project.');
        }

        // Create invitation token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Check for existing pending invitation
        await Invitation.deleteMany({ email: normalizedEmail, projectId, accepted: false });

        const invitation = await Invitation.create({
            email: normalizedEmail,
            projectId,
            token,
            expiresAt
        });

        // Send Email
        await sendInvitationEmail(normalizedEmail, project.name, token);

        res.status(200).json({
            message: 'Invitation sent successfully. Member will be added once they confirm.',
            invitation: {
                email: invitation.email,
                expiresAt: invitation.expiresAt
            }
        });
    } catch (error) {
        next(error);
    }
}

async function acceptInvitation(req, res, next) {
    try {
        const { token } = req.body;

        if (!token) {
            res.status(400);
            throw new Error('Token is required.');
        }

        const invitation = await Invitation.findOne({ 
            token, 
            accepted: false,
            expiresAt: { $gt: Date.now() }
        });

        if (!invitation) {
            res.status(404);
            throw new Error('Invalid or expired invitation.');
        }

        const project = await Project.findById(invitation.projectId);
        if (!project) {
            res.status(404);
            throw new Error('Project no longer exists.');
        }

        // Add member to project if not already there
        const email = normalizeEmail(invitation.email);
        if (!project.members.includes(email)) {
            project.members.push(email);
            // Ensure uniqueness
            project.members = sanitizeMembers(project.members);
            await project.save();
        }

        invitation.accepted = true;
        await invitation.save();

        res.status(200).json({
            message: `Successfully joined ${project.name}.`,
            projectId: project._id,
            projectName: project.name
        });
    } catch (error) {
        next(error);
    }
}

async function updateProjectMembers(req, res, next) {
    try {
        const { projectId } = req.params;
        const { members } = req.body;

        if (!Array.isArray(members)) {
            res.status(400);
            throw new Error('Members must be an array of emails.');
        }

        const sanitizedMembers = members
            .map((member) => String(member).trim())
            .filter(Boolean);

        const project = await Project.findOne({ _id: projectId, owner: req.user?.id });
        if (!project) {
            res.status(404);
            throw new Error('Project not found.');
        }

        project.members = sanitizeMembers(sanitizedMembers);
        await project.save();

        res.status(200).json({
            message: 'Project members updated successfully.',
            project
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createProject,
    listProjects,
    getProjectSummary,
    deleteProject,
    inviteMember,
    acceptInvitation,
    updateProjectMembers
};
