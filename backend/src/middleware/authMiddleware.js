const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { getEnvConfig } = require('../config/env');

async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization || '';
        const [scheme, token] = authHeader.split(' ');

        if (scheme !== 'Bearer' || !token) {
            res.status(401);
            throw new Error('Authorization token is required.');
        }

        const { jwtSecret } = getEnvConfig();
        const decoded = jwt.verify(token, jwtSecret);

        const user = await User.findById(decoded.id);
        if (!user) {
            res.status(401);
            throw new Error('Invalid or expired token.');
        }

        req.user = {
            id: String(user._id),
            name: user.name,
            email: user.email
        };

        next();
    } catch (error) {
        if (error?.name === 'JsonWebTokenError' || error?.name === 'TokenExpiredError' || error?.name === 'NotBeforeError') {
            res.status(401);
            return next(new Error('Session expired. Please log in again.'));
        }

        if (res.statusCode === 200) {
            res.status(401);
        }
        next(error);
    }
}

module.exports = {
    authenticate
};
