const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Wishlist = require('./models/Wishlist');
const Order = require('./models/Order');
const SpecialOrder = require('./models/SpecialOrder');
const SpecialOrderOffer = require('./models/SpecialOrderOffer');
const Notification = require('./models/Notification');
const Payment = require('./models/Payment');
require('dotenv').config();

async function populateDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm2home');
    console.log('Connected to MongoDB');

    // Clear existing data (optional, for fresh start)
    await User.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Wishlist.deleteMany({});
    await Order.deleteMany({});
    await SpecialOrder.deleteMany({});
    await SpecialOrderOffer.deleteMany({});
    await Notification.deleteMany({});
    await Payment.deleteMany({});

    // Create sample users
    const admin = new User({
      name: 'Admin User',
      email: 'admin@farm2home.com',
      phone: '1234567890',
      password_hash: '$2b$10$dummy.hash.for.demo',
      role: 'admin'
    });
    await admin.save();

    const farmer = new User({
      name: 'John Farmer',
      email: 'farmer@farm2home.com',
      phone: '1234567891',
      password_hash: '$2b$10$dummy.hash.for.demo',
      role: 'farmer',
      farm_name: 'Green Valley Farm',
      location: 'California',
      farming_type: 'Organic'
    });
    await farmer.save();

    const consumer = new User({
      name: 'Jane Consumer',
      email: 'consumer@farm2home.com',
      phone: '1234567892',
      password_hash: '$2b$10$dummy.hash.for.demo',
      role: 'consumer'
    });
    await consumer.save();

    // Create sample products
    const product1 = new Product({
      name: 'Organic Tomatoes',
      description: 'Fresh organic tomatoes',
      price: 50,
      category: 'Vegetables',
      farmer_id: farmer._id
    });
    await product1.save();

    const product2 = new Product({
      name: 'Fresh Apples',
      description: 'Crisp red apples',
      price: 80,
      category: 'Fruits',
      farmer_id: farmer._id
    });
    await product2.save();

    // Create sample cart
    const cart = new Cart({
      user_id: consumer._id,
      product_id: product1._id,
      quantity: 2
    });
    await cart.save();

    // Create sample wishlist
    const wishlist = new Wishlist({
      user_id: consumer._id,
      product_id: product2._id
    });
    await wishlist.save();

    // Create sample order
    const order = new Order({
      id: 'ORD001',
      orderNumber: 'ORD001',
      user_id: consumer._id,
      items: [{
        productId: product1._id.toString(),
        product_id: product1._id.toString(),
        name: product1.name,
        quantity: 2,
        price: product1.price
      }],
      total: 100,
      address: '123 Main St, City, State'
    });
    await order.save();

    // Create sample special order
    const specialOrder = new SpecialOrder({
      consumer_id: consumer._id,
      farmer_id: farmer._id,
      product_name: 'Custom Vegetable Basket',
      description: 'Mixed seasonal vegetables',
      quantity: 5,
      unit: 'kg',
      preferred_price: 200,
      delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      consumer_address: '123 Main St, City, State',
      consumer_phone: '1234567892'
    });
    await specialOrder.save();

    // Create sample special order offer
    const specialOrderOffer = new SpecialOrderOffer({
      farmer_id: farmer._id,
      product_name: 'Seasonal Vegetable Mix',
      description: 'Fresh seasonal vegetables',
      quantity: 10,
      unit: 'kg',
      price_per_unit: 40,
      available_from: new Date(),
      available_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
    await specialOrderOffer.save();

    // Create sample notification
    const notification = new Notification({
      user_id: consumer._id,
      type: 'order',
      title: 'Order Confirmed',
      message: 'Your order ORD001 has been confirmed',
      data: { orderId: order._id }
    });
    await notification.save();

    // Create sample payment
    const payment = new Payment({
      order_id: order._id,
      user_id: consumer._id,
      amount: 100,
      payment_method: 'card',
      transaction_id: 'TXN001',
      status: 'completed'
    });
    await payment.save();

    console.log('Database populated successfully!');
    console.log('Collections created:');
    console.log('- users');
    console.log('- products');
    console.log('- carts');
    console.log('- wishlists');
    console.log('- orders');
    console.log('- specialorders');
    console.log('- specialorderoffers');
    console.log('- notifications');
    console.log('- payments');

  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

populateDatabase();
