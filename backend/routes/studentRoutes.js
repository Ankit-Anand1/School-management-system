const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { 
  getAllStudents, 
  getStudentById, 
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');

router.post('/', protect, adminOnly, createStudent);
router.get('/', protect, adminOnly, getAllStudents);
router.get('/:id', protect, adminOnly, getStudentById);
router.put('/:id', protect, adminOnly, updateStudent);
router.delete('/:id', protect, adminOnly, deleteStudent);

module.exports = router;
