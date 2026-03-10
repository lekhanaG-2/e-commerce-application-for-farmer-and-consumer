const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');

// Middleware to verify user authentication
const verifyUser = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Middleware to check if user is verified
const checkVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.status !== 'active' || !user.email_verified || !user.phone_verified) {
      return res.status(403).json({ error: 'User must be verified to place orders. Please verify email and phone.' });
    }
    next();
  } catch (error) {
    console.error('Error checking user verification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/orders - Get orders for authenticated user
router.get('/', verifyUser, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id }).sort({ created_at: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/orders - Place a new order
router.post('/', verifyUser, checkVerification, async (req, res) => {
  const userId = req.user.id;
  const { items, total, addressId } = req.body;

  console.log('Creating order for user:', userId);
  console.log('Request body:', { items, total, addressId });

  try {
    // Check if user has verified addresses
    const user = await User.findById(userId);
    console.log('User found:', user ? 'yes' : 'no');
    console.log('User addresses:', user.addresses);

    const verifiedAddresses = user.addresses.filter(addr => addr.verified);
    console.log('Verified addresses:', verifiedAddresses.length);

    if (verifiedAddresses.length === 0) {
      return res.status(400).json({ error: 'No verified address found. Please add and verify an address.' });
    }

    let selectedAddress = verifiedAddresses[0];
    if (addressId) {
      const validAddress = verifiedAddresses.find(addr => addr._id.toString() === addressId);
      if (!validAddress) {
        return res.status(400).json({ error: 'Invalid or unverified address selected.' });
      }
      selectedAddress = validAddress;
    }

    console.log('Selected address:', selectedAddress);

    const orderId = 'ORD' + Date.now();
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const orderData = {
      id: orderId,
      orderNumber,
      user_id: userId,
      items,
      total,
      status: 'pending',
      address: selectedAddress.address,
      address_id: selectedAddress._id,
      created_at: new Date()
    };

    console.log('Order data to save:', orderData);

    const order = new Order(orderData);
    await order.save();

    // Send notifications to farmers
    try {
      // Get unique farmer IDs from the ordered products
      const farmerIds = [];
      for (const item of items) {
        const product = await Product.findById(item.product_id);
        if (product && product.farmer_id && !farmerIds.includes(product.farmer_id.toString())) {
          farmerIds.push(product.farmer_id.toString());
        }
      }

      // Create notifications for each farmer
      for (const farmerId of farmerIds) {
        const farmer = await User.findById(farmerId);
        if (farmer && farmer.role === 'farmer') {
          // Get farmer's products in this order
          const farmerProducts = [];
          for (const item of items) {
            const product = await Product.findById(item.product_id);
            if (product && product.farmer_id.toString() === farmerId) {
              farmerProducts.push(item);
            }
          }

          const totalAmount = farmerProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);

          await Notification.create({
            user_id: farmerId,
            type: 'order',
            title: 'New Order Received',
            message: `You have received a new order for $${totalAmount.toFixed(2)}. Order ID: ${orderId}`,
            data: {
              orderId: orderId,
              customerName: user.name,
              totalAmount: totalAmount,
              products: farmerProducts
            }
          });
        }
      }
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // Don't fail the order if notifications fail
    }

    console.log('Order saved successfully');
    res.status(201).json({ message: 'Order created successfully', orderId });
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// PUT /api/orders/:orderId/status - Update order status (admin or owner)
router.put('/:orderId/status', verifyUser, async (req, res) => {
  const orderId = req.params.orderId;
  const { status } = req.body;
  const userId = req.user.id;

  try {
    // Check if user is admin or order owner
    const user = await User.findById(userId);
    if (user.role !== 'admin') {
      const order = await Order.findOne({ id: orderId });
      if (!order || order.user_id.toString() !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    await Order.findOneAndUpdate({ id: orderId }, { status });
    res.json({ message: 'Order status updated' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
