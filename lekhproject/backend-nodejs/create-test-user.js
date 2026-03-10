const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm2home');
    console.log('Connected to MongoDB');

    // Create test consumer
    const hashedPassword = await bcrypt.hash('test123', 10);
    const testUser = new User({
      name: 'Test Consumer',
      email: 'test@farm2home.com',
      phone: '9999999999',
      password_hash: hashedPassword,
      role: 'consumer',
      status: 'active',
      email_verified: true,
      phone_verified: true
    });

    await testUser.save();
    console.log('Test user created successfully!');
    console.log('Email: test@farm2home.com');
    console.log('Password: test123');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createTestUser();
