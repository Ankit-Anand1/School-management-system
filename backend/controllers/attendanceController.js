const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.addAttendance = async (req, res) => {
  try {
    const { student, date, status, remarks } = req.body;
    const studentExists = await User.findOne({ _id: student, role: 'student' });
    if (!studentExists) return res.status(404).json({ success: false, message: 'Student not found' });

    const attendance = new Attendance({ student, date, status, remarks });
    await attendance.save();

    // Create notification for the student
    await Notification.create({
      user: student,
      message: `Attendance marked: ${status} on ${new Date(date).toLocaleDateString()}`,
      type: 'attendance'
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    let query = {};
    if (req.query.studentId) query.student = req.query.studentId;
    if (req.user.role === 'student') query.student = req.user.id;

    const attendance = await Attendance.find(query).populate('student', 'name email').sort('-date');
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getAttendanceByStudentId = async (req, res) => {
  try {
    const query = { student: req.params.id };
    if (req.user.role === 'student' && req.user.id !== req.params.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const attendance = await Attendance.find(query).populate('student', 'name email').sort('-date');
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!attendance) return res.status(404).json({ success: false, message: 'Attendance not found' });
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
