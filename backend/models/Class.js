const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
