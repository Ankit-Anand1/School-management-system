const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue'],
    default: 'Pending'
  },
  type: {
    type: String, // e.g., 'Tuition', 'Library', 'Transport'
    required: true
  },
  transactionId: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);
