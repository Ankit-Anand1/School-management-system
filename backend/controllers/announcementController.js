const Announcement = require('../models/Announcement');

exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ active: true }).sort('-createdAt');
    res.json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create(req.body);
    // Create notifications for all students
    const User = require('../models/User');
    const Notification = require('../models/Notification');
    const students = await User.find({ role: 'student' });
    const notifs = students.map(s => ({
      user: s._id,
      message: `New announcement: ${req.body.title}`,
      type: 'announcement'
    }));
    if (notifs.length > 0) await Notification.insertMany(notifs);
    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
