const Class = require('../models/Class');

exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find().sort({ date: 1, time: 1 });
    res.json({ success: true, count: classes.length, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createClass = async (req, res) => {
  try {
    const newClass = await Class.create(req.body);
    res.status(201).json({ success: true, data: newClass });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
