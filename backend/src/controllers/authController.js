const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { getEnvConfig } = require('../config/env');

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function generateToken(user) {
    const { jwtSecret } = getEnvConfig();

    return jwt.sign(
        {
            id: String(user._id),
            email: user.email,
            name: user.name
        },
        jwtSecret,
        { expiresIn: '7d' }
    );
}

// Nodemailer Transporter Setup
async function sendOTPEmail(email, otp) {
    const config = getEnvConfig();
    
    // Fallback to ethereal if no credentials provided
    const transporter = nodemailer.createTransport({
        service: config.emailService || 'gmail',
        auth: {
            user: config.emailUser || 'devspace.ai.sprint@gmail.com', // Placeholder
            pass: config.emailPass || 'your-app-password' // Placeholder
        }
    });

    const mailOptions = {
        from: `"DevSpace Security" <${config.emailUser || 'devspace.ai.sprint@gmail.com'}>`,
        to: email,
        subject: 'DevSpace - Verify Your Identity',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020617; color: #ffffff; padding: 40px; border-radius: 20px; max-width: 600px; margin: auto; border: 1px solid #1e293b;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #3b82f6; margin: 0; font-size: 28px;">DEVSPACE</h1>
                    <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Secure Authorization Node</p>
                </div>
                <div style="background-color: #0f172a; padding: 30px; border-radius: 12px; border: 1px solid #334155; text-align: center;">
                    <p style="font-size: 16px; margin-bottom: 25px;">Please use the following code to complete your registration:</p>
                    <div style="font-size: 42px; font-weight: 800; letter-spacing: 15px; color: #3b82f6; margin: 20px 0; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; border: 1px dashed #3b82f6;">
                        ${otp}
                    </div>
                    <p style="font-size: 12px; color: #94a3b8; margin-top: 25px;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
                </div>
                <div style="text-align: center; margin-top: 30px; font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 2px;">
                    DevSpace Protocol // Automated Terminal Response
                </div>
            </div>
        `
    };

    try {
        console.log(`\n[DEV SECURITY] OTP for ${email}: ${otp}\n`);
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Email Error:', error.message);
    }
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

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const user = await User.create({
            name: String(name).trim(),
            email: normalizedEmail,
            password,
            otp,
            otpExpires,
            isVerified: false
        });

        // Send Email
        await sendOTPEmail(normalizedEmail, otp);

        res.status(201).json({
            message: 'OTP sent to your email. Please verify to complete registration.',
            email: user.email
        });
    } catch (error) {
        next(error);
    }
}

async function verifyOTP(req, res, next) {
    try {
        const { email, otp } = req.body;
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail || !otp) {
            res.status(400);
            throw new Error('Email and OTP are required.');
        }

        const user = await User.findOne({ 
            email: normalizedEmail,
            otp,
            otpExpires: { $gt: Date.now() }
        }).select('+otp +otpExpires');

        if (!user) {
            res.status(400);
            throw new Error('Invalid or expired OTP.');
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = generateToken(user);

        res.status(200).json({
            message: 'Email verified successfully.',
            token,
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

async function resendOTP(req, res, next) {
    try {
        const { email } = req.body;
        const normalizedEmail = normalizeEmail(email);

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            res.status(404);
            throw new Error('User not found.');
        }

        if (user.isVerified) {
            res.status(400);
            throw new Error('Account is already verified.');
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendOTPEmail(normalizedEmail, otp);

        res.status(200).json({
            message: 'A new OTP has been sent to your email.'
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

        if (!user.isVerified) {
            res.status(403).json({
                message: 'Email not verified. Please verify your email.',
                requiresVerification: true,
                email: user.email
            });
            return;
        }

        const token = generateToken(user);

        res.status(200).json({
            message: 'Login successful.',
            token,
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

async function getCurrentUser(req, res, next) {
    try {
        const user = await User.findById(req.user?.id);

        if (!user) {
            res.status(404);
            throw new Error('User not found.');
        }

        res.status(200).json({
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

async function updateProfile(req, res, next) {
    try {
        const { name, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user?.id).select('+password');

        if (!user) {
            res.status(404);
            throw new Error('User not found.');
        }

        if (name !== undefined) {
            const trimmedName = String(name).trim();
            if (!trimmedName) {
                res.status(400);
                throw new Error('Name cannot be empty.');
            }
            user.name = trimmedName;
        }

        const wantsPasswordChange = Boolean(currentPassword || newPassword);
        if (wantsPasswordChange) {
            if (!currentPassword || !newPassword) {
                res.status(400);
                throw new Error('Current password and new password are required to change password.');
            }

            const passwordMatched = await user.comparePassword(currentPassword);
            if (!passwordMatched) {
                res.status(401);
                throw new Error('Current password is incorrect.');
            }

            if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(newPassword)) {
                res.status(400);
                throw new Error('New password must be at least 6 characters and include a letter and a number.');
            }

            user.password = newPassword;
        }

        await user.save();

        const token = generateToken(user);

        res.status(200).json({
            message: 'Profile updated successfully.',
            token,
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
    verifyOTP,
    resendOTP,
    loginUser,
    getCurrentUser,
    updateProfile
};
