const express = require('express');
const router = express.Router();
const { getClasses, createClass } = require('../controllers/classController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getClasses)
  .post(protect, adminOnly, createClass);

module.exports = router;
