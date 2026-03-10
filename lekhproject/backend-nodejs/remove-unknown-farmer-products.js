const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

async function removeUnknownFarmerProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm2home', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} total products`);

    // Get all valid farmer IDs
    const validFarmers = await User.find({ role: 'farmer' }).select('_id');
    const validFarmerIds = validFarmers.map(farmer => farmer._id.toString());

    console.log(`Found ${validFarmerIds.length} valid farmers`);

    // Find products with invalid farmer_id
    const productsToRemove = products.filter(product => {
      if (!product.farmer_id) {
        return true; // No farmer_id at all
      }
      return !validFarmerIds.includes(product.farmer_id.toString());
    });

    console.log(`Found ${productsToRemove.length} products with unknown/invalid farmers`);

    // Show details of products to be removed
    productsToRemove.forEach((product, index) => {
      console.log(`${index + 1}. Product: ${product.name}, Farmer ID: ${product.farmer_id || 'null'}`);
    });

    if (productsToRemove.length === 0) {
      console.log('No products to remove');
      return;
    }

    // Remove the products
    const productIdsToRemove = productsToRemove.map(product => product._id);
    const result = await Product.deleteMany({ _id: { $in: productIdsToRemove } });

    console.log(`Removed ${result.deletedCount} products with unknown farmers`);

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

removeUnknownFarmerProducts();
