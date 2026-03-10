const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm2home');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists, updating password:', existingAdmin.email);
      const hashedPassword = await bcrypt.hash('lekh@123', 10);
      existingAdmin.password_hash = hashedPassword;
      existingAdmin.email = 'lekhanag561@gmail.com';
      await existingAdmin.save();
      console.log('Admin password updated successfully!');
      console.log('Email: lekhanag561@gmail.com');
      console.log('Password: lekh@123');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = new User({
      name: 'Admin User',
      email: 'admin@farm2home.com',
      phone: '9876543210',
      password_hash: hashedPassword,
      status: 'active',
      email_verified: true,
      phone_verified: true,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@farm2home.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createAdmin();
