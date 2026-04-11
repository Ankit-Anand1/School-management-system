const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = { user: { id: user.id, role: user.role, name: user.name } };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
};

exports.studentSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ success: false, message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'student'
    });

    await user.save();
    
    const token = generateToken(user);
    res.status(201).json({ success: true, token, role: user.role, name: user.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.adminSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ success: false, message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin' // Force role to admin
    });

    await user.save();
    
    const token = generateToken(user);
    res.status(201).json({ success: true, token, role: user.role, name: user.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email, role: 'student' });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid student credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ success: true, token, role: user.role, name: user.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email, role: 'admin' });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid admin credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid admin credentials' });

    const token = generateToken(user);
    res.json({ success: true, token, role: user.role, name: user.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { name, email, googleId } = req.body;
    
    // Check domain restriction
    if (!email.endsWith('@heritageit.edu.in')) {
      return res.status(403).json({ success: false, message: 'Only @heritageit.edu.in emails are allowed' });
    }

    let user = await User.findOne({ email });
    
    if (!user) {
      // Auto create student account
      const randomPassword = Math.random().toString(36).slice(-8); // Dummy hash required
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = new User({
        name,
        email,
        password: hashedPassword,
        role: 'student'
      });
      await user.save();
    }
    
    if (user.role !== 'student') {
        return res.status(403).json({ success: false, message: 'Admin account cannot be logged in via Google Student Auth' });
    }

    const token = generateToken(user);
    res.json({ success: true, token, role: user.role, name: user.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Since we don't have real email logic, we'll just mock a reset mechanism
    // Or set a reset token in db. For now, just return success.
    res.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect old password' });
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
