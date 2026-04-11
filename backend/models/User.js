const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  phone: String,
  address: String,
  course: String,
  batch: String,
  avatar: String,
  guardianName: String,
  guardianPhone: String,
  fatherName: String,
  motherName: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
