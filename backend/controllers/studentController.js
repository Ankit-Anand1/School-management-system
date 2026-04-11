const User = require('../models/User');

// GET /api/users/profile — own profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// PUT /api/users/profile — update own profile
exports.updateProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.password;
    delete updateData.role; 

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password');
    if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET /api/students — all students (admin only)
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort('-createdAt');
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET /api/students/:id — single student (admin only)
exports.getStudentById = async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' }).select('-password');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// POST /api/students — create student (admin only)
exports.createStudent = async (req, res) => {
  try {
    const { name, email, password, ...rest } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ success: false, message: 'User already exists with this email' });

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'default123', salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'student',
      ...rest
    });

    await user.save();
    const returnUser = user.toObject();
    delete returnUser.password;
    res.status(201).json({ success: true, data: returnUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// PUT /api/students/:id — update student (admin only)
exports.updateStudent = async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.password;
    delete updateData.role;

    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      updateData,
      { new: true }
    ).select('-password');

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// DELETE /api/students/:id — delete student (admin only)
exports.deleteStudent = async (req, res) => {
  try {
    const student = await User.findOneAndDelete({ _id: req.params.id, role: 'student' });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
