const mongoose = require('mongoose');
const Order = require('./models/Order');

async function checkOrderDetails() {
  try {
    await mongoose.connect('mongodb://localhost:27017/farm2home');
    console.log('Connected to MongoDB');

    const orders = await Order.find({}).limit(2);
    console.log('Sample orders:');
    orders.forEach(order => {
      console.log(`Order ${order.id}:`);
      console.log(`  User: ${order.user_id}`);
      console.log(`  Total: $${order.total}`);
      console.log('  Items:');
      order.items.forEach(item => {
        console.log(`    - Product ID: ${item.product_id} (${typeof item.product_id})`);
        console.log(`      ProductId: ${item.productId} (${typeof item.productId})`);
        console.log(`      Name: ${item.name}, Qty: ${item.quantity}, Price: $${item.price}`);
      });
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkOrderDetails();
