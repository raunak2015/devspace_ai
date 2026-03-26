const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 60
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            minlength: 6,
            select: false
        },
        googleId: {
            type: String,
            sparse: true,
            unique: true
        },
        authProvider: {
            type: String,
            enum: ['local', 'google'],
            default: 'local'
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        otp: {
            type: String,
            select: false
        },
        otpExpires: {
            type: Date,
            select: false
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre('save', async function hashPassword(next) {
    if (!this.password || !this.isModified('password')) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
