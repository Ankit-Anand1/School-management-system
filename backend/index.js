const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('DB Connection Error: ', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/fees', require('./routes/feesRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/users', require('./routes/usersRoutes'));
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// General Error Handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
