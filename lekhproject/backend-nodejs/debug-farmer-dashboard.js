const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

async function debugFarmerDashboard() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/farm2home', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Find the farmer with most products (nandish)
    const farmer = await User.findOne({ email: 'nandish@gmail.com' });
    if (!farmer) {
      console.log('Farmer nandish not found');
      return;
    }
    console.log('Found farmer:', farmer.name, farmer._id);

    // Get farmer's products
    const farmerProducts = await Product.find({ farmer_id: farmer._id });
    console.log('Farmer products:', farmerProducts.length);
    farmerProducts.forEach(p => console.log('  -', p.name, p._id));

    if (farmerProducts.length === 0) {
      console.log('No products found for farmer');
      return;
    }

    // Get farmer product IDs as strings
    const farmerProductIds = farmerProducts.map(p => p._id);
    const farmerProductIdStrings = farmerProductIds.map(id => id.toString());
    console.log('Product IDs:', farmerProductIdStrings);

    // Find orders containing farmer's products
    const farmerOrders = await Order.find({
      'items.product_id': { $in: farmerProductIdStrings }
    });
    console.log('Orders containing farmer products:', farmerOrders.length);

    farmerOrders.forEach(order => {
      console.log('Order:', order.id, 'Total:', order.total, 'Items:');
      order.items.forEach(item => {
        console.log('  - Product ID:', item.product_id, 'Name:', item.name, 'Qty:', item.quantity, 'Price:', item.price);
      });
    });

    // Calculate total sales
    let totalSales = 0;
    farmerOrders.forEach(order => {
      order.items.forEach(item => {
        if (farmerProductIdStrings.includes(item.product_id.toString())) {
          totalSales += item.price * item.quantity;
        }
      });
    });
    console.log('Total sales calculated:', totalSales);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugFarmerDashboard();
