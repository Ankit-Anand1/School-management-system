const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/studentController');
const { getMe } = require('../controllers/authController');

// /api/users/me — JWT-verified user data (alias for /api/auth/me)
router.get('/me', protect, getMe);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
