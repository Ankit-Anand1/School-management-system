const Fee = require('../models/Fee');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.addFee = async (req, res) => {
  try {
    const { student, amount, type, status, transactionId } = req.body;
    const studentExists = await User.findOne({ _id: student, role: 'student' });
    if (!studentExists) return res.status(404).json({ success: false, message: 'Student not found' });

    const fee = new Fee({ student, amount, type, status, transactionId });
    await fee.save();

    // Create notification for the student
    await Notification.create({
      user: student,
      message: `Fee ${status}: $${amount} (${type})`,
      type: 'fees'
    });

    res.status(201).json({ success: true, data: fee });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getAllFees = async (req, res) => {
  try {
    let query = {};
    if (req.query.studentId) query.student = req.query.studentId;
    if (req.user.role === 'student') query.student = req.user.id;

    const fees = await Fee.find(query).populate('student', 'name email').sort('-date');
    res.json({ success: true, data: fees });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getFeeById = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id).populate('student', 'name email');
    if (!fee) return res.status(404).json({ success: false, message: 'Fee not found' });
    
    if (req.user.role === 'student' && fee.student._id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: fee });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('student', 'name email');
    if (!fee) return res.status(404).json({ success: false, message: 'Fee not found' });

    // Notify the student about update
    if (fee.student?._id) {
      await Notification.create({
        user: fee.student._id,
        message: `Fee updated: $${fee.amount} → ${fee.status}`,
        type: 'fees'
      });
    }

    res.json({ success: true, data: fee });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
