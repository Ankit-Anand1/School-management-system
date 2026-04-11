const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@school.edu.in';
    const password = 'adminpassword123';

    let user = await User.findOne({ email });
    if (user) {
      console.log('Admin user already exists');
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name: 'Super Admin',
      email,
      password: hashedPassword,
      role: 'admin'
    });

    await user.save();
    console.log('Admin user successfully seeded!');
    process.exit();
  } catch (error) {
    console.error('Error seeding admin', error);
    process.exit(1);
  }
};

seedAdmin();
