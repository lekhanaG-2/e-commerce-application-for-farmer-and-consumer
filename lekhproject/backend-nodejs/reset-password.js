const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function resetPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/farm2home');
    console.log('Connected to MongoDB');

    // Find the farmer
    const farmer = await User.findOne({ email: 'nandish@gmail.com' });
    if (!farmer) {
      console.log('Farmer not found');
      return;
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Update the password
    farmer.password = hashedPassword;
    await farmer.save();

    console.log('Password reset successfully for nandish@gmail.com');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

resetPassword();
