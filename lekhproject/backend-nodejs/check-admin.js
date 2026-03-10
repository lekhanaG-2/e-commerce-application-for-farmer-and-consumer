const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm2home');
    console.log('Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log('Admin user found:');
      console.log('ID:', admin._id);
      console.log('Name:', admin.name);
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Status:', admin.status);
      console.log('Email Verified:', admin.email_verified);
      console.log('Phone Verified:', admin.phone_verified);
    } else {
      console.log('No admin user found in database');
    }

  } catch (error) {
    console.error('Error checking admin:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkAdmin();
