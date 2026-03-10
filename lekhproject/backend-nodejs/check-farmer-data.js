const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
require('dotenv').config();

async function checkFarmerData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm2home');
    console.log('Connected to MongoDB');

    // Find all farmers
    const farmers = await User.find({ role: 'farmer' });
    console.log(`Found ${farmers.length} farmers:`);
    farmers.forEach(farmer => {
      console.log(`- ${farmer.name} (${farmer.email}) - ID: ${farmer._id}`);
    });

    if (farmers.length === 0) {
      console.log('No farmers found in database');
      return;
    }

    // Check products for each farmer
    for (const farmer of farmers) {
      console.log(`\nProducts for ${farmer.name}:`);
      const products = await Product.find({ farmer_id: farmer._id });
      console.log(`- Total products: ${products.length}`);
      products.forEach(product => {
        console.log(`  - ${product.name} (ID: ${product._id}, Stock: ${product.stock_quantity}, Price: $${product.price})`);
      });

      // Check orders containing farmer's products
      const farmerProductIds = products.map(p => p._id);
      if (farmerProductIds.length > 0) {
        const orders = await Order.find({
          'items.product_id': { $in: farmerProductIds }
        });
        console.log(`- Orders containing farmer's products: ${orders.length}`);
        orders.forEach(order => {
          console.log(`  - Order ID: ${order.id}, Total: $${order.total}, Status: ${order.status}`);
        });
      } else {
        console.log('- No products, so no orders');
      }
    }

    // Check all orders
    const allOrders = await Order.find({});
    console.log(`\nTotal orders in database: ${allOrders.length}`);
    allOrders.forEach(order => {
      console.log(`- Order ID: ${order.id}, User: ${order.user_id}, Total: $${order.total}, Items: ${order.items.length}`);
    });

  } catch (error) {
    console.error('Error checking farmer data:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkFarmerData();
