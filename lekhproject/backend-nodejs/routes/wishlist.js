const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
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
    res.status(401).json({ error: 'Invalid token' });
  }
};

// GET /api/wishlist - Get wishlist items for authenticated user
router.get('/', verifyUser, async (req, res) => {
  try {
    const wishlistItems = await Wishlist.find({ user_id: req.user.id }).populate({
      path: 'product_id',
      populate: {
        path: 'farmer_id',
        select: 'name farm_name'
      }
    });
    res.json(wishlistItems);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// POST /api/wishlist - Add item to wishlist
router.post('/', verifyUser, async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ error: 'Product ID required' });
  }

  try {
    // Check if already in wishlist
    const existing = await Wishlist.findOne({ user_id: userId, product_id: productId });
    if (existing) {
      return res.status(400).json({ error: 'Item already in wishlist' });
    }

    const wishlistItem = new Wishlist({
      user_id: userId,
      product_id: productId
    });
    await wishlistItem.save();
    res.status(201).json({ message: 'Item added to wishlist' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// DELETE /api/wishlist/:productId - Remove item from wishlist
router.delete('/:productId', verifyUser, async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.productId;

  try {
    await Wishlist.findOneAndDelete({ user_id: userId, product_id: productId });
    res.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

module.exports = router;
