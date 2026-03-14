const User = require('../models/User');

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

async function registerUser(req, res, next) {
    try {
        const { name, email, password } = req.body;
        const normalizedEmail = normalizeEmail(email);

        if (!name || !normalizedEmail || !password) {
            res.status(400);
            throw new Error('Name, email, and password are required.');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            res.status(400);
            throw new Error('Please provide a valid email address.');
        }

        if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password)) {
            res.status(400);
            throw new Error('Password must be at least 6 characters and include a letter and a number.');
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            res.status(409);
            throw new Error('An account with this email already exists.');
        }

        const user = await User.create({
            name: String(name).trim(),
            email: normalizedEmail,
            password
        });

        res.status(201).json({
            message: 'Account created successfully.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
}

async function loginUser(req, res, next) {
    try {
        const { email, password } = req.body;
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail || !password) {
            res.status(400);
            throw new Error('Email and password are required.');
        }

        const user = await User.findOne({ email: normalizedEmail }).select('+password');
        if (!user) {
            res.status(401);
            throw new Error('Invalid email or password.');
        }

        const passwordMatched = await user.comparePassword(password);
        if (!passwordMatched) {
            res.status(401);
            throw new Error('Invalid email or password.');
        }

        res.status(200).json({
            message: 'Login successful.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    registerUser,
    loginUser
};
