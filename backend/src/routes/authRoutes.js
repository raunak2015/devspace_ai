const express = require('express');

const { loginUser, registerUser, getCurrentUser, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authenticate, getCurrentUser);
router.patch('/profile', authenticate, updateProfile);

module.exports = router;
