const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Admin middleware
const adminAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Get platform statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    // Total farmers
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    // Total consumers
    const totalConsumers = await User.countDocuments({ role: 'consumer' });
    // Total products
    const totalProducts = await Product.countDocuments();
    // Total orders
    const totalOrders = await Order.countDocuments();
    // Total earnings
    const orders = await Order.find({ status: 'delivered' });
    const totalEarnings = orders.reduce((sum, order) => sum + order.total, 0);

    res.json({
      totalFarmers,
      totalConsumers,
      totalProducts,
      totalOrders,
      totalEarnings
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get all farmers
router.get('/farmers', adminAuth, async (req, res) => {
  try {
    console.log('Fetching farmers...');
    const farmers = await User.find({ role: 'farmer' }).select('name email phone farm_name location status created_at');
    console.log('Raw farmers from DB:', farmers);
    const formattedFarmers = farmers.map(farmer => ({
      id: farmer._id.toString(),
      name: farmer.name,
      email: farmer.email,
      contact: farmer.phone,
      location: farmer.location,
      status: farmer.status,
      created_at: farmer.created_at,
      verified: farmer.status === 'active', // Assuming active farmers are verified
      rating: 4.5 // Placeholder rating
    }));
    console.log('Formatted farmers being sent:', JSON.stringify(formattedFarmers));
    res.status(200).json(formattedFarmers);
  } catch (error) {
    console.error('Error fetching farmers:', error);
    res.status(500).json({ error: 'Failed to fetch farmers' });
  }
});

// Get all consumers
router.get('/consumers', adminAuth, async (req, res) => {
  try {
    console.log('Fetching consumers...');
    const consumers = await User.find({ role: 'consumer' }).select('name email phone status created_at');
    console.log('Consumers found:', consumers.length);
    const formattedConsumers = consumers.map(consumer => ({
      id: consumer._id,
      name: consumer.name,
      email: consumer.email,
      phone: consumer.phone,
      status: consumer.status,
      joinDate: consumer.created_at,
      totalOrders: 0, // Placeholder, would need aggregation
      totalSpent: 0 // Placeholder, would need aggregation
    }));
    res.json(formattedConsumers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch consumers' });
  }
});

// Get all orders
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().populate('user_id', 'name email').sort({ created_at: -1 });
    const formattedOrders = orders.map(order => ({
      id: order._id,
      farmerName: 'N/A', // Would need to populate from products
      consumerName: order.user_id?.name || 'N/A',
      totalAmount: order.total,
      status: order.status,
      date: order.created_at,
      paymentStatus: order.payment_status || 'pending',
      items: order.items || []
    }));
    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get all products
router.get('/products', adminAuth, async (req, res) => {
  try {
    const products = await Product.find().populate('farmer_id', 'name farm_name location');
    const formattedProducts = products.map(product => ({
      id: product._id,
      name: product.name,
      farmerName: product.farmer_id?.name || 'N/A',
      farmerLocation: product.farmer_id?.location || 'N/A',
      price: product.price,
      stock_quantity: product.stock_quantity,
      category: product.category,
      status: product.status,
      salesCount: 0, // Placeholder, would need aggregation
      rating: product.rating || 0,
      created_at: product.created_at
    }));
    res.json(formattedProducts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get earnings
router.get('/earnings', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find({ status: 'delivered' }).select('total created_at');
    const totalEarnings = orders.reduce((sum, order) => sum + order.total, 0);

    // Monthly earnings
    const monthlyEarnings = {};
    orders.forEach(order => {
      const month = order.created_at.toISOString().slice(0, 7); // YYYY-MM
      monthlyEarnings[month] = (monthlyEarnings[month] || 0) + order.total;
    });

    const monthlyEarningsArray = Object.entries(monthlyEarnings).map(([month, earnings]) => ({
      month,
      earnings
    })).sort((a, b) => a.month.localeCompare(b.month));

    res.json({ totalEarnings, monthlyEarnings: monthlyEarningsArray });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

// Get reports
router.get('/reports', adminAuth, async (req, res) => {
  try {
    // Basic reports - can be expanded
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      deliveredOrders,
      orderCompletionRate: totalOrders > 0 ? (deliveredOrders / totalOrders * 100).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Update farmer status (verify/block)
router.put('/farmers/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const farmer = await User.findOneAndUpdate(
      { _id: id, role: 'farmer' },
      { status },
      { new: true }
    );

    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    res.json({ message: 'Farmer status updated successfully', farmer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update farmer status' });
  }
});

// Update consumer status (block/unblock)
router.put('/consumers/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const consumer = await User.findOneAndUpdate(
      { _id: id, role: 'consumer' },
      { status },
      { new: true }
    );

    if (!consumer) {
      return res.status(404).json({ error: 'Consumer not found' });
    }

    res.json({ message: 'Consumer status updated successfully', consumer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update consumer status' });
  }
});

// Update product status
router.put('/products/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('farmer_id', 'name farm_name');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product status updated successfully', product });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product status' });
  }
});

// Update order status
router.put('/orders/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('user_id', 'name email');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Delete farmer
router.delete('/farmers/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const farmer = await User.findOneAndDelete({ _id: id, role: 'farmer' });

    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    res.json({ message: 'Farmer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete farmer' });
  }
});

// Delete consumer
router.delete('/consumers/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const consumer = await User.findOneAndDelete({ _id: id, role: 'consumer' });

    if (!consumer) {
      return res.status(404).json({ error: 'Consumer not found' });
    }

    res.json({ message: 'Consumer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete consumer' });
  }
});

// Delete product
router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Delete order
router.delete('/orders/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Get settings
router.get('/settings', adminAuth, async (req, res) => {
  try {
    // For now, return default settings. In production, this would come from database
    const settings = {
      general: {
        siteName: 'Farm2Home',
        siteDescription: 'Connecting farmers directly with consumers',
        contactEmail: 'admin@farm2home.com',
        contactPhone: '+91 9876543210',
        currency: 'INR',
        timezone: 'Asia/Kolkata'
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        newOrderAlerts: true,
        lowStockAlerts: true,
        farmerVerificationAlerts: true,
        paymentAlerts: true
      },
      system: {
        maintenanceMode: false,
        maintenanceMessage: 'Site is under maintenance. Please check back later.',
        autoBackup: true,
        backupFrequency: 'daily',
        dataRetention: 365
      },
      security: {
        sessionTimeout: 30,
        passwordMinLength: 8,
        twoFactorAuth: false,
        loginAttempts: 5,
        ipWhitelist: false
      }
    };

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings
router.put('/settings', adminAuth, async (req, res) => {
  try {
    const { settings } = req.body;

    // For now, just return success. In production, save to database
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get notifications
router.get('/notifications', adminAuth, async (req, res) => {
  try {
    const notifications = [];

    // Get recent orders (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentOrders = await Order.find({
      created_at: { $gte: yesterday }
    }).populate('user_id', 'name').sort({ created_at: -1 }).limit(5);

    recentOrders.forEach(order => {
      notifications.push({
        id: `order_${order._id}`,
        type: 'new-order',
        title: 'New Order Placed',
        message: `Order #${order._id.toString().slice(-8)} placed by ${order.user_id?.name || 'Unknown Customer'} for ₹${order.total}`,
        timestamp: order.created_at,
        priority: 'normal',
        read: false
      });
    });

    // Get low stock products
    const lowStockProducts = await Product.find({
      stock_quantity: { $lt: 10, $gt: 0 }
    }).populate('farmer_id', 'name farm_name').limit(5);

    lowStockProducts.forEach(product => {
      notifications.push({
        id: `stock_${product._id}`,
        type: 'low-stock',
        title: 'Low Stock Alert',
        message: `${product.name} from ${product.farmer_id?.name || 'Unknown Farmer'} has only ${product.stock_quantity} units left`,
        timestamp: new Date(),
        priority: 'high',
        read: false
      });
    });

    // Get out of stock products
    const outOfStockProducts = await Product.find({
      stock_quantity: 0
    }).populate('farmer_id', 'name farm_name').limit(5);

    outOfStockProducts.forEach(product => {
      notifications.push({
        id: `outofstock_${product._id}`,
        type: 'low-stock',
        title: 'Out of Stock Alert',
        message: `${product.name} from ${product.farmer_id?.name || 'Unknown Farmer'} is out of stock`,
        timestamp: new Date(),
        priority: 'high',
        read: false
      });
    });

    // Get pending farmer verifications
    const pendingFarmers = await User.find({
      role: 'farmer',
      status: 'pending'
    }).limit(5);

    pendingFarmers.forEach(farmer => {
      notifications.push({
        id: `verification_${farmer._id}`,
        type: 'farmer-verification',
        title: 'Farmer Verification Pending',
        message: `${farmer.name} (${farmer.email}) is waiting for verification`,
        timestamp: farmer.created_at,
        priority: 'medium',
        read: false
      });
    });

    // Sort notifications by timestamp (most recent first)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit to 10 most recent notifications
    const limitedNotifications = notifications.slice(0, 10);

    res.json(limitedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

module.exports = router;
