const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

async function removeBrinjalProduct() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm2home', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find the product named "brinjal"
    const brinjalProduct = await Product.findOne({ name: 'brinjal' });

    if (!brinjalProduct) {
      console.log('No product named "brinjal" found');
      return;
    }

    console.log('Found brinjal product:', {
      id: brinjalProduct._id,
      name: brinjalProduct.name,
      farmer_id: brinjalProduct.farmer_id
    });

    // Check if the farmer exists and is named nikitha
    if (brinjalProduct.farmer_id) {
      const farmer = await User.findById(brinjalProduct.farmer_id);
      if (farmer) {
        console.log('Farmer details:', {
          id: farmer._id,
          name: farmer.name,
          email: farmer.email,
          role: farmer.role
        });
      }
    }

    // Remove the product
    const result = await Product.deleteOne({ _id: brinjalProduct._id });
    console.log(`Removed ${result.deletedCount} brinjal product`);

    // Verify remaining products
    const remainingProducts = await Product.find({});
    console.log(`Remaining products: ${remainingProducts.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

removeBrinjalProduct();
