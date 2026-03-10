const mongoose = require('mongoose');
const SpecialOrderOffer = require('./models/SpecialOrderOffer');
require('dotenv').config();

async function testSpecialOrderOffer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm2home');
    console.log('Connected to MongoDB');

    // Create a test offer
    const testOffer = new SpecialOrderOffer({
      farmer_id: new mongoose.Types.ObjectId(), // Dummy ObjectId
      product_name: 'Test Product',
      description: 'Test description',
      quantity: 100,
      unit: 'kg',
      price_per_unit: 50,
      minimum_order: 10,
      available_from: new Date(),
      available_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      delivery_options: ['home_delivery'],
      payment_terms: 'Cash on delivery',
      notes: 'Test notes'
    });

    await testOffer.save();
    console.log('Test offer created successfully:', testOffer);

    // Fetch all offers
    const offers = await SpecialOrderOffer.find();
    console.log('All offers:', offers.length);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

testSpecialOrderOffer();