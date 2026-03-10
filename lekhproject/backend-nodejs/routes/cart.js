const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const User = require('../models/User');
const Product = require('../models/Product');
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

// Middleware to check if user is verified (for checkout/add sensitive actions)
const checkVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.status !== 'active' || !user.email_verified || !user.phone_verified) {
      return res.status(403).json({ error: 'User must be verified to manage cart for orders. Please verify email and phone.' });
    }
    next();
  } catch (error) {
    console.error('Error checking user verification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/cart - Get cart items for authenticated user (browse allowed without verification)
router.get('/', verifyUser, async (req, res) => {
  try {
    const cartItems = await Cart.find({ user_id: req.user.id }).populate('product_id', 'name price quantity');
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart - Add item to cart (requires verification for order preparation)
router.post('/', verifyUser, checkVerification, async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;
  if (!productId || !quantity) {
    return res.status(400).json({ error: 'Product ID and quantity required' });
  }

  try {
    // Check if item exists, update quantity or insert new
    const existingItem = await Cart.findOne({ user_id: userId, product_id: productId });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
      res.json({ message: 'Cart updated', cartId: existingItem._id });
    } else {
      const cartItem = new Cart({
        user_id: userId,
        product_id: productId,
        quantity
      });
      await cartItem.save();
      res.status(201).json({ message: 'Item added to cart' });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// DELETE /api/cart/:productId - Remove item from cart
router.delete('/:productId', verifyUser, checkVerification, async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.productId;

  try {
    await Cart.findOneAndDelete({ user_id: userId, product_id: productId });
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

module.exports = router;
