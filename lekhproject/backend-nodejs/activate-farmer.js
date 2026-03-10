const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function activateFarmer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm2home');
    console.log('Connected to MongoDB');

    // Check if farmer exists
    let farmer = await User.findOne({ email: 'nandish@gmail.com' });

    if (!farmer) {
      console.log('Farmer not found, creating new farmer...');

      // Create the farmer
      const hashedPassword = await bcrypt.hash('farmer123', 10);
      farmer = new User({
        name: 'Nandish Farmer',
        email: 'nandish@gmail.com',
        phone: '9876543210',
        password_hash: hashedPassword,
        role: 'farmer',
        status: 'active',
        email_verified: true,
        phone_verified: true,
        farm_name: 'Nandish Farm',
        location: 'Bangalore'
      });

      await farmer.save();
      console.log('Farmer created successfully!');
    } else {
      // Update status to active
      farmer.status = 'active';
      await farmer.save();
      console.log('Farmer activated successfully!');
    }

    console.log('Farmer details:');
    console.log('Name:', farmer.name);
    console.log('Email:', farmer.email);
    console.log('Role:', farmer.role);
    console.log('Status:', farmer.status);
    console.log('Farm:', farmer.farm_name);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

activateFarmer();