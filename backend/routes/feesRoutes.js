const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { 
  addFee, 
  getAllFees, 
  getFeeById, 
  updateFee 
} = require('../controllers/feeController');
const Fee = require('../models/Fee'); // Directly access for specific student route

// Add route for /api/fees/student/:id to match user request
router.get('/student/:id', protect, async (req, res) => {
  try {
    if (req.user.role === 'student' && req.user.id !== req.params.id) {
       return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const fees = await Fee.find({ student: req.params.id }).populate('student', 'name email').sort('-date');
    res.json({ success: true, data: fees });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', protect, adminOnly, addFee);
router.get('/', protect, getAllFees);
router.get('/:id', protect, getFeeById);
router.put('/:id', protect, adminOnly, updateFee);

module.exports = router;
