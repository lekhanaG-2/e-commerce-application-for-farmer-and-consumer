const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const SpecialOrder = require('../models/SpecialOrder');
const SpecialOrderOffer = require('../models/SpecialOrderOffer');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

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
      return res.status(403).json({ error: 'User must be verified to place special orders. Please verify email and phone.' });
    }
    req.userAadhaar = user.aadhaar;
    next();
  } catch (error) {
    console.error('Error checking user verification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to verify farmer authentication
const verifyFarmer = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'farmer') {
      return res.status(403).json({ error: 'Access denied. Farmer access required.' });
    }
    req.farmer = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// GET /api/special-orders - Get all special orders (for consumers to view their orders)
router.get('/', verifyUser, async (req, res) => {
  console.log('SpecialOrders GET /: Received request');
  console.log('SpecialOrders GET /: Method:', req.method);
  console.log('SpecialOrders GET /: URL:', req.url);
  console.log('SpecialOrders GET /: Headers:', req.headers);

  try {
    const specialOrders = await SpecialOrder.find({ consumer_id: req.user.id })
      .populate('farmer_id', 'name farm_name location')
      .sort({ created_at: -1 });
    res.json(specialOrders);
  } catch (error) {
    console.error('Error fetching special orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/farmers - List all farmers
router.get('/farmers', async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' }).select('name email phone farm_name location status created_at');
    res.json(farmers);
  } catch (error) {
    console.error('Error fetching farmers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/farmers/:farmerId/products - Get products for a specific farmer
router.get('/farmers/:farmerId/products', async (req, res) => {
  const { farmerId } = req.params;
  try {
    const products = await Product.find({ farmer_id: farmerId, status: 'active' })
      .populate('farmer_id', 'name farm_name location profile_photo');
    res.json(products);
  } catch (error) {
    console.error('Error fetching farmer products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/special-orders/bulk-products - Get all bulk products with farmer details
router.get('/bulk-products', async (req, res) => {
  try {
    console.log('Fetching bulk products...');
    const bulkProducts = await Product.find({
      status: 'active',
      product_type: 'bulk'
    })
    .populate('farmer_id', 'name farm_name location profile_photo')
    .sort({ created_at: -1 });

    console.log('Found', bulkProducts.length, 'bulk products');

    // Group products by farmer
    const farmersWithProducts = {};
    bulkProducts.forEach(product => {
      if (!product.farmer_id) {
        console.log('Product without farmer:', product.name);
        return;
      }
      const farmerId = product.farmer_id._id.toString();
      if (!farmersWithProducts[farmerId]) {
        farmersWithProducts[farmerId] = {
          id: farmerId,
          name: product.farmer_id.name,
          location: product.farmer_id.farm_name || product.farmer_id.location,
          profileImage: product.farmer_id.profile_photo,
          products: []
        };
      }
      farmersWithProducts[farmerId].products.push({
        id: product._id,
        productName: product.name,
        imageUrl: product.image_url,
        price_per_unit: product.price,
        unit: product.unit || 'kg',
        available_qty: product.stock_quantity || 0,
        minimumOrder: product.minimumOrder || 1,
        description: product.description,
        category: product.category,
        product_type: product.product_type
      });
    });

    const result = Object.values(farmersWithProducts);
    console.log('Returning', result.length, 'farmers with products');
    res.json(result);
  } catch (error) {
    console.error('Error fetching bulk products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/special-orders - Create a new special order (single or bulk)
router.post('/', verifyUser, checkVerification, async (req, res) => {
  console.log('SpecialOrders POST /special-orders: Received request');
  console.log('SpecialOrders POST /special-orders: Request body:', req.body);
  console.log('SpecialOrders POST /special-orders: Headers:', req.headers);

  try {
    const {
      farmer_id,
      farmerId,
      product_name,
      description,
      quantity,
      unit,
      preferred_price,
      delivery_date,
      consumer_address,
      consumer_phone,
      // Bulk order fields
      items,
      eventType,
      deliveryAddress,
      contactPhone,
      notes
    } = req.body;

    // Check if this is a bulk order
    const isBulkOrder = items && Array.isArray(items) && items.length > 0;

    if (isBulkOrder) {
      // Handle bulk order
      console.log('Processing bulk order');

      // Validate bulk order required fields
      if (!farmerId || !items || !delivery_date || !deliveryAddress || !contactPhone) {
        return res.status(400).json({ error: 'Farmer ID, items, delivery date, address, and phone are required for bulk orders' });
      }

      // Verify farmer exists and is active
      const farmer = await User.findById(farmerId);
      if (!farmer || farmer.role !== 'farmer' || farmer.status !== 'active') {
        return res.status(404).json({ error: 'Farmer not found or not active' });
      }

      // Validate items
      for (const item of items) {
        if (!item.productId || !item.productName || !item.qty || !item.unit || !item.price_per_unit) {
          return res.status(400).json({ error: 'All item fields are required' });
        }
        if (item.qty <= 0) {
          return res.status(400).json({ error: 'Item quantity must be greater than 0' });
        }
      }

      const specialOrder = new SpecialOrder({
        consumer_id: req.user.id,
        farmer_id: farmerId,
        is_bulk_order: true,
        items,
        eventType,
        delivery_date,
        consumer_address: deliveryAddress,
        consumer_phone: contactPhone,
        notes
      });

      await specialOrder.save();
      res.status(201).json({
        message: 'Bulk order created successfully',
        order: specialOrder
      });
    } else {
      // Handle single product special order
      console.log('Processing single product special order');

      // Validate required fields
      if (!farmer_id || !product_name || !description || !quantity || !unit || !preferred_price || !delivery_date || !consumer_address || !consumer_phone) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Verify farmer exists and is active
      const farmer = await User.findById(farmer_id);
      if (!farmer || farmer.role !== 'farmer' || farmer.status !== 'active') {
        return res.status(404).json({ error: 'Farmer not found or not active' });
      }

      const specialOrder = new SpecialOrder({
        consumer_id: req.user.id,
        farmer_id,
        product_name,
        description,
        quantity,
        unit,
        preferred_price,
        delivery_date,
        consumer_address,
        consumer_phone
      });

      await specialOrder.save();
      res.status(201).json({
        message: 'Special order created successfully',
        order: specialOrder
      });
    }
  } catch (error) {
    console.error('Error creating special order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/special-orders/farmer/:farmerId - Get special orders for a farmer
router.get('/special-orders/farmer/:farmerId', verifyFarmer, async (req, res) => {
  try {
    const { farmerId } = req.params;

    // Ensure farmer can only access their own orders
    if (req.farmer.id !== farmerId) {
      return res.status(403).json({ error: 'Access denied. You can only view your own orders.' });
    }

    const specialOrders = await SpecialOrder.find({ farmer_id: farmerId })
      .populate('consumer_id', 'name email phone')
      .sort({ created_at: -1 });

    res.json(specialOrders);
  } catch (error) {
    console.error('Error fetching special orders for farmer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/special-orders/:orderId - Update special order status
router.patch('/special-orders/:orderId', verifyFarmer, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, farmer_response, farmer_price, farmer_notes } = req.body;

    const specialOrder = await SpecialOrder.findById(orderId);
    if (!specialOrder) {
      return res.status(404).json({ error: 'Special order not found' });
    }

    // Ensure farmer can only update their own orders
    if (specialOrder.farmer_id.toString() !== req.farmer.id) {
      return res.status(403).json({ error: 'Access denied. You can only update your own orders.' });
    }

    // Update fields
    if (status) specialOrder.status = status;
    if (farmer_response !== undefined) specialOrder.farmer_response = farmer_response;
    if (farmer_price !== undefined) specialOrder.farmer_price = farmer_price;
    if (farmer_notes !== undefined) specialOrder.farmer_notes = farmer_notes;

    await specialOrder.save();

    res.json({
      message: 'Special order updated successfully',
      order: specialOrder
    });
  } catch (error) {
    console.error('Error updating special order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Farmer Special Order Offers Routes (placeholder - not implemented in MongoDB yet)

// GET /api/special-orders/farmer/special-orders - Get farmer's special order offers
router.get('/farmer/special-orders', verifyFarmer, async (req, res) => {
  try {
    const offers = await SpecialOrderOffer.find({ farmer_id: req.farmer.id })
      .sort({ created_at: -1 });
    res.json(offers);
  } catch (error) {
    console.error('Error fetching farmer special order offers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/special-orders/farmer/special-orders - Create a new special order offer
router.post('/farmer/special-orders', verifyFarmer, upload.single('image'), async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('Received file:', req.file);

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

    // Parse and validate numbers
    const parsedQuantity = parseInt(quantity);
    const parsedPrice = parseFloat(price_per_unit);
    const parsedMinOrder = parseInt(minimum_order || '1');

    // Validate required fields
    if (!product_name || isNaN(parsedQuantity) || !unit || isNaN(parsedPrice) || !available_from || !available_until) {
      console.log('Validation failed:', {
        product_name: !!product_name,
        quantity: parsedQuantity,
        unit: !!unit,
        price_per_unit: parsedPrice,
        available_from: !!available_from,
        available_until: !!available_until,
        minimum_order: parsedMinOrder
      });
      return res.status(400).json({
        error: 'Required fields are missing or invalid',
        details: {
          product_name: !!product_name,
          quantity: !isNaN(parsedQuantity),
          unit: !!unit,
          price_per_unit: !isNaN(parsedPrice),
          available_from: !!available_from,
          available_until: !!available_until,
          minimum_order: !isNaN(parsedMinOrder)
        }
      });
    }

    // Parse delivery options if it's a string
    let deliveryOpts = ['home_delivery'];
    if (delivery_options) {
      try {
        deliveryOpts = typeof delivery_options === 'string' ? JSON.parse(delivery_options) : delivery_options;
      } catch (e) {
        console.log('Error parsing delivery_options:', e);
        deliveryOpts = ['home_delivery'];
      }
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const offer = new SpecialOrderOffer({
      farmer_id: req.farmer.id,
      product_name: product_name.trim(),
      description: description || '',
      quantity: parsedQuantity,
      unit,
      price_per_unit: parsedPrice,
      minimum_order: parsedMinOrder,
      available_from: new Date(available_from),
      available_until: new Date(available_until),
      delivery_options: deliveryOpts,
      payment_terms: payment_terms || 'Cash on delivery',
      notes: notes || '',
      image
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

// PUT /api/special-orders/farmer/special-orders/:id - Update a special order offer
router.put('/farmer/special-orders/:id', upload.single('image'), verifyFarmer, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Handle image upload
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const offer = await SpecialOrderOffer.findOneAndUpdate(
      { _id: id, farmer_id: req.farmer.id },
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

// DELETE /api/special-orders/farmer/special-orders/:id - Delete a special order offer
router.delete('/farmer/special-orders/:id', verifyFarmer, async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await SpecialOrderOffer.findOneAndDelete({
      _id: id,
      farmer_id: req.farmer.id
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

// GET /api/special-orders/offers - Get all active special order offers (for consumers and admins)
router.get('/special-orders/offers', async (req, res) => {
  try {
    const offers = await SpecialOrderOffer.find({ status: 'active' })
      .populate('farmer_id', 'name farm_name location')
      .sort({ created_at: -1 });
    res.json(offers);
  } catch (error) {
    console.error('Error fetching special order offers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
