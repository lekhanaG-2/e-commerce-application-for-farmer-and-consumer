const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm2home');
    console.log('Connected to MongoDB');

    const adminUsers = await User.find({ role: 'admin' }).select('-password_hash');
    console.log('Admin Users:');
    adminUsers.forEach(user => {
      console.log(`- Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Phone: ${user.phone}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Status: ${user.status}`);
      console.log(`  Created: ${user.created_at}`);
      console.log('---');
    });

    if (adminUsers.length === 0) {
      console.log('No admin users found. Creating one...');

      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const admin = new User({
        name: 'Admin User',
        email: 'admin@farm2home.com',
        phone: '1234567890',
        password_hash: hashedPassword,
        role: 'admin',
        status: 'active',
        email_verified: true,
        phone_verified: true
      });

      await admin.save();
      console.log('Admin user created!');
      console.log('Email: admin@farm2home.com');
      console.log('Password: admin123');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkAdminUser();
