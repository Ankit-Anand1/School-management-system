const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { 
  addAttendance, 
  getAllAttendance, 
  getAttendanceByStudentId, 
  updateAttendance 
} = require('../controllers/attendanceController');

router.post('/', protect, adminOnly, addAttendance);
router.get('/', protect, getAllAttendance);
router.get('/student/:id', protect, getAttendanceByStudentId);
router.put('/:id', protect, adminOnly, updateAttendance);

module.exports = router;
