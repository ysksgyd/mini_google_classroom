const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server/.env') });

const User = require('./server/models/User');

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Delete existing test user if any
    await User.deleteOne({ email: 'test@gmail.com' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const newUser = new User({
      name: 'Test Student',
      email: 'test@gmail.com',
      password: hashedPassword,
      role: 'Student',
      academicClass: '1st bca'
    });

    await newUser.save();
    console.log('Test user created: test@gmail.com / password123');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error creating user:', err);
  }
}

createTestUser();
