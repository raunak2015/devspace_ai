const express = require('express');

const { loginUser, registerUser, verifyOTP, resendOTP, getCurrentUser, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/me', authenticate, getCurrentUser);
router.patch('/profile', authenticate, updateProfile);

module.exports = router;
