const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
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

// GET /api/products - Get all products or filter by category
router.get('/', async (req, res) => {
  try {
    const category = req.query.category;
    console.log('Category query param:', category);
    let query = { status: 'active' };

    if (category && category.toLowerCase() !== 'all') {
      query.category = new RegExp(`^${category.toLowerCase().trim()}$`, 'i');
    }

    console.log('Executing query:', query);
    // Return all active products for consumer products endpoint, from active farmers
    const products = await Product.find(query).populate({
      path: 'farmer_id',
      match: { status: 'active' },
      select: 'name farm_name'
    }).then(products => products.filter(product => product.farmer_id !== null));
    console.log('Products returned:', products.length);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('farmer_id', 'name farm_name');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Farmer middleware
const farmerAuth = (req, res, next) => {
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

// POST /api/products - Create a new product (farmer only)
router.post('/', upload.single('image'), farmerAuth, [
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Product description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('category').notEmpty().withMessage('Category is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, price, quantity, category } = req.body;
  const farmerId = req.farmer.id;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      stock_quantity: parseInt(quantity),
      category,
      image_url,
      farmer_id: farmerId,
      status: 'active'
    });

    const savedProduct = await product.save();
    await savedProduct.populate('farmer_id', 'name farm_name');

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/products/:id - Update product (farmer only, own products)
router.put('/:id', farmerAuth, [
  body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Product description cannot be empty'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('quantity').optional().isNumeric().withMessage('Quantity must be a number'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const productId = req.params.id;
  const farmerId = req.farmer.id;
  const updates = req.body;

  try {
    // Find product and verify ownership
    const product = await Product.findOne({ _id: productId, farmer_id: farmerId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or access denied' });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        if (key === 'quantity') {
          product.stock_quantity = parseInt(updates[key]);
        } else {
          product[key] = updates[key];
        }
      }
    });

    const updatedProduct = await product.save();
    await updatedProduct.populate('farmer_id', 'name farm_name');

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/products/:id - Delete product (farmer only, own products)
router.delete('/:id', farmerAuth, async (req, res) => {
  const productId = req.params.id;
  const farmerId = req.farmer.id;

  try {
    const product = await Product.findOneAndDelete({ _id: productId, farmer_id: farmerId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or access denied' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/products/farmer/:farmerId - Get products by farmer (public)
router.get('/farmer/:farmerId', async (req, res) => {
  const { farmerId } = req.params;

  try {
    const products = await Product.find({ farmer_id: farmerId, status: 'active' }).populate('farmer_id', 'name farm_name');
    res.json(products);
  } catch (error) {
    console.error('Error fetching farmer products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
