const express = require('express');
const router = express.Router();
const { 
  studentSignup, 
  adminSignup,
  studentLogin, 
  adminLogin, 
  googleLogin, 
  getMe,
  forgotPassword,
  changePassword 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/student-signup', studentSignup);
router.post('/admin-signup', adminSignup);
router.post('/student-login', studentLogin);
router.post('/admin-login', adminLogin);
router.post('/google-login', googleLogin);
router.post('/forgot-password', forgotPassword);
router.put('/change-password', protect, changePassword);

router.get('/me', protect, getMe);

module.exports = router;
