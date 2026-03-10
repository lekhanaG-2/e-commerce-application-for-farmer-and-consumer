const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Farmer authentication middleware
const farmerAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'farmer') {
      return res.status(403).json({ error: 'Access denied. Farmer role required.' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// GET /api/farmers - Get all farmers (public endpoint)
router.get('/', async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer', status: 'active' }).select('name email phone farm_name location status created_at');
    res.json(farmers);
  } catch (error) {
    console.error('Error fetching farmers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/farmers/profile - Get farmer profile
router.get('/profile', farmerAuth, async (req, res) => {
  try {
    const farmer = await User.findById(req.user.id);
    if (!farmer || farmer.role !== 'farmer') {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    res.json({
      id: farmer._id,
      name: farmer.name,
      email: farmer.email,
      phone: farmer.phone,
      farmName: farmer.farm_name,
      location: farmer.location,
      farmSize: farmer.farm_size,
      farmingType: farmer.farming_type,
      experience: farmer.experience,
      certifications: farmer.certifications || [],
      idProof: farmer.id_proof,
      profilePhoto: farmer.profile_photo,
      createdAt: farmer.created_at
    });
  } catch (error) {
    console.error('Get farmer profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/farmers/profile - Update farmer profile
router.put('/profile', farmerAuth, async (req, res) => {
  const farmerId = req.user.id;
  const { name, email, phone, farmName, location, farmSize, farmingType, experience, certifications } = req.body;

  try {
    // Check if email or phone changed and unique
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: farmerId } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    if (phone) {
      const existingUser = await User.findOne({ phone, _id: { $ne: farmerId } });
      if (existingUser) {
        return res.status(400).json({ error: 'Phone already exists' });
      }
    }

    // Update farmer profile
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (farmName) updateData.farm_name = farmName;
    if (location) updateData.location = location;
    if (farmSize) updateData.farm_size = farmSize;
    if (farmingType) updateData.farming_type = farmingType;
    if (experience) updateData.experience = experience;
    if (certifications) updateData.certifications = certifications;

    const farmer = await User.findByIdAndUpdate(farmerId, updateData, { new: true });

    res.json({
      message: 'Profile updated successfully',
      farmer: {
        id: farmer._id,
        name: farmer.name,
        email: farmer.email,
        phone: farmer.phone,
        farmName: farmer.farm_name,
        location: farmer.location,
        farmSize: farmer.farm_size,
        farmingType: farmer.farming_type,
        experience: farmer.experience,
        certifications: farmer.certifications || [],
        idProof: farmer.id_proof,
        profilePhoto: farmer.profile_photo,
        createdAt: farmer.created_at
      }
    });
  } catch (error) {
    console.error('Update farmer profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/farmers/products - Get farmer's products
router.get('/products', farmerAuth, async (req, res) => {
  try {
    const products = await Product.find({ farmer_id: req.user.id });
    res.json(products);
  } catch (error) {
    console.error('Get farmer products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/farmers/products - Add new product
router.post('/products', upload.single('image'), farmerAuth, async (req, res) => {
  const farmerId = req.user.id;
  const name = req.body.name || '';
  const price = req.body.price || '';
  const quantity = req.body.quantity || '';
  const category = req.body.category || '';
  const description = req.body.description || '';
  const minimumOrder = req.body.minimumOrder || '';
  const product_type = req.body.product_type || 'regular';
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  console.log('Add product request body:', req.body); // Debug logging
  console.log('Add product file:', req.file); // Debug logging

  try {
    // Validation
    if (!name.trim() || !price || !quantity) {
      return res.status(400).json({ error: 'Name, price, and quantity are required' });
    }

    const farmer = await User.findById(farmerId);
    if (!farmer || farmer.role !== 'farmer') {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    const product = new Product({
      name: name.trim(),
      description: description,
      price: parseFloat(price),
      stock_quantity: parseFloat(quantity),
      image_url,
      category: category || 'General',
      farmer_id: farmerId,
      status: 'active',
      minimumOrder: minimumOrder ? parseFloat(minimumOrder) : 0,
      product_type: product_type,
      created_at: new Date()
    });

    await product.save();

    res.status(201).json({
      message: 'Product added successfully',
      product
    });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// GET /api/farmers/dashboard - Get farmer dashboard stats
router.get('/dashboard', farmerAuth, async (req, res) => {
  try {
    const farmerId = req.user.id;

    // Total products and quantity
    const productStats = await Product.aggregate([
      { $match: { farmer_id: farmerId } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: '$stock_quantity' }
        }
      }
    ]);

    const totalProducts = productStats.length > 0 ? productStats[0].totalProducts : 0;
    const totalQuantity = productStats.length > 0 ? productStats[0].totalQuantity : 0;

    // Total orders and sales - calculate actual values
    const farmerProductIds = await Product.find({ farmer_id: farmerId }).distinct('_id');
    const farmerProductIdStrings = farmerProductIds.map(id => id.toString());

    // Get all orders that contain farmer's products
    const farmerOrders = await Order.find({
      'items.product_id': { $in: farmerProductIdStrings }
    });

    const totalOrders = farmerOrders.length;

    // Calculate total sales by summing up the amounts for farmer's products in all orders
    let totalSales = 0;
    farmerOrders.forEach(order => {
      order.items.forEach(item => {
        if (farmerProductIds.some(pid => pid.equals(item.product_id))) {
          totalSales += item.price * item.quantity;
        }
      });
    });

    // Recent orders - get actual recent orders with product details
    const recentOrders = await Order.find({
      'items.product_id': { $in: farmerProductIdStrings }
    })
    .populate('user_id', 'name')
    .sort({ created_at: -1 })
    .limit(5)
    .select('id user_id total status created_at items');

    console.log(`Recent orders for farmer ${farmerId}: ${recentOrders.length}`);
    recentOrders.forEach(order => {
      console.log(`- Order ${order.id}: ${order.total}, Status: ${order.status}`);
    });

    // Top products - calculate actual sales data
    const topProducts = [];

    // Calculate sales for each product
    for (const productId of farmerProductIds) {
      const product = await Product.findById(productId);
      if (!product) continue;

      let totalQuantitySold = 0;
      let totalRevenue = 0;

      farmerOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.product_id === productId.toString()) {
            totalQuantitySold += item.quantity;
            totalRevenue += item.price * item.quantity;
          }
        });
      });

      if (totalQuantitySold > 0) {
        topProducts.push({
          _id: product._id,
          name: product.name,
          totalQuantitySold,
          totalRevenue,
          price: product.price,
          image_url: product.image_url
        });
      }
    }

    // Sort by total revenue and take top 5
    topProducts.sort((a, b) => b.totalRevenue - a.totalRevenue);
    const top5Products = topProducts.slice(0, 5);

    res.json({
      totalProducts,
      totalQuantity,
      totalOrders,
      totalSales,
      recentOrders: recentOrders.map(order => {
        // Get only the products that belong to this farmer
        const farmerItems = order.items.filter(item =>
          farmerProductIds.some(pid => pid.equals(item.product_id))
        );

        return {
          _id: order._id,
          id: order.id,
          consumerId: {
            name: order.user_id?.name || 'Unknown Customer'
          },
          products: farmerItems.map(item => ({
            name: item.name,
            quantity: item.quantity
          })),
          totalAmount: farmerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          status: order.status,
          createdAt: order.created_at
        };
      }),
      topProducts: top5Products
    });
  } catch (error) {
    console.error('Get farmer dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// GET /api/farmers/orders - Get farmer's orders
router.get('/orders', farmerAuth, async (req, res) => {
  try {
    const farmerId = req.user.id;
    const farmerProducts = await Product.find({ farmer_id: farmerId }).distinct('_id');

    const orders = await Order.find({
      'items.product_id': { $in: farmerProducts }
    })
    .populate('user_id', 'name phone')
    .sort({ created_at: -1 });

    const formattedOrders = orders.map(order => ({
      id: order.id,
      consumerId: order.user_id?._id,
      consumerName: order.user_id?.name || 'Unknown',
      consumerPhone: order.user_id?.phone || '',
      totalAmount: order.total,
      status: order.status,
      createdAt: order.created_at,
      deliveryAddress: order.address,
      products: order.items
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Get farmer orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// PUT /api/farmers/orders/:orderId/status - Update order status
router.put('/orders/:orderId/status', farmerAuth, async (req, res) => {
  const farmerId = req.user.id;
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findOne({ id: orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify the order contains products from this farmer
    const farmerProducts = await Product.find({ farmer_id: farmerId }).distinct('_id');
    const farmerProductIds = farmerProducts.map(id => id.toString());
    const hasFarmerProducts = order.items.some(item => farmerProductIds.includes(item.product_id));

    if (!hasFarmerProducts) {
      return res.status(403).json({ error: 'Order not authorized' });
    }

    // Store old status for notification
    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // Create notification for consumer if status changed
    if (oldStatus !== status) {
      const Notification = require('../models/Notification');
      const statusMessages = {
        'confirmed': 'Your order has been confirmed',
        'shipped': 'Your order has been shipped',
        'delivered': 'Your order has been delivered',
        'cancelled': 'Your order has been cancelled'
      };

      if (statusMessages[status]) {
        const notification = new Notification({
          user_id: order.user_id,
          title: 'Order Update',
          message: `${statusMessages[status]} (Order #${orderId})`,
          type: 'order',
          read: false
        });
        await notification.save();
      }
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// GET /api/farmers/earnings - Get farmer earnings
router.get('/earnings', farmerAuth, async (req, res) => {
  try {
    // Simplified earnings calculation
    const totalEarnings = 0; // Placeholder
    const monthlyEarnings = []; // Placeholder

    res.json({
      totalEarnings,
      monthlyEarnings
    });
  } catch (error) {
    console.error('Get farmer earnings error:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

const SpecialOrderOffer = require('../models/SpecialOrderOffer');
const Notification = require('../models/Notification');

// GET /api/farmers/special-orders - Get farmer's special order offers
router.get('/special-orders', farmerAuth, async (req, res) => {
  try {
    const offers = await SpecialOrderOffer.find({ farmer_id: req.user.id })
      .sort({ created_at: -1 });
    res.json(offers);
  } catch (error) {
    console.error('Error fetching farmer special order offers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/farmers/special-orders - Create a new special order offer
router.post('/special-orders', farmerAuth, async (req, res) => {
  try {
    const {
      product_name,
      description,
      quantity,
      unit,
      price_per_unit,
      minimum_order,
      available_from,
      available_until,
      delivery_options,
      payment_terms,
      notes
    } = req.body;

    // Validate required fields
    if (!product_name || !description || !quantity || !unit || !price_per_unit || !available_from || !available_until) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const offer = new SpecialOrderOffer({
      farmer_id: req.user.id,
      product_name,
      description,
      quantity,
      unit,
      price_per_unit,
      minimum_order: minimum_order || 1,
      available_from,
      available_until,
      delivery_options: delivery_options || ['home_delivery'],
      payment_terms: payment_terms || 'Cash on delivery',
      notes
    });

    await offer.save();
    res.status(201).json({
      message: 'Special order offer created successfully',
      offer
    });
  } catch (error) {
    console.error('Error creating special order offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/farmers/special-orders/:id - Update a special order offer
router.put('/special-orders/:id', farmerAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const offer = await SpecialOrderOffer.findOneAndUpdate(
      { _id: id, farmer_id: req.user.id },
      updateData,
      { new: true }
    );

    if (!offer) {
      return res.status(404).json({ error: 'Special order offer not found' });
    }

    res.json({
      message: 'Special order offer updated successfully',
      offer
    });
  } catch (error) {
    console.error('Error updating special order offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/farmers/special-orders/:id - Delete a special order offer
router.delete('/special-orders/:id', farmerAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await SpecialOrderOffer.findOneAndDelete({
      _id: id,
      farmer_id: req.user.id
    });

    if (!offer) {
      return res.status(404).json({ error: 'Special order offer not found' });
    }

    res.json({ message: 'Special order offer deleted successfully' });
  } catch (error) {
    console.error('Error deleting special order offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/farmers/notifications - Get farmer's notifications
router.get('/notifications', farmerAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user.id })
      .sort({ created_at: -1 })
      .limit(50); // Limit to last 50 notifications

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching farmer notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/farmers/notifications/:id/read - Mark notification as read
router.put('/notifications/:id/read', farmerAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user_id: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/farmers/notifications/mark-all-read - Mark all notifications as read
router.put('/notifications/mark-all-read', farmerAuth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user.id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/farmers/notifications/unread-count - Get unread notifications count
router.get('/notifications/unread-count', farmerAuth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user_id: req.user.id,
      read: false
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error fetching unread notifications count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
