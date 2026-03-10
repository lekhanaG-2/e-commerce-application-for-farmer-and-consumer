const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// GET /api/dashboard/featured-products - Get featured products for consumer dashboard
router.get('/featured-products', async (req, res) => {
  try {
    // Get featured products (limit to 8 for dashboard) - only regular products
    const products = await Product.find({
      status: 'active',
      $or: [
        { product_type: 'regular' },
        { product_type: { $exists: false } },
        { product_type: null }
      ]
    })
      .populate('farmer_id', 'name farm_name')
      .sort({ created_at: -1 })
      .limit(8);

    // Add badges based on criteria
    const productsWithBadges = products.map(product => {
      const badges = [];
      if (product.category && product.category.toLowerCase().includes('organic')) badges.push('Organic');
      if (product.rating >= 4.5) badges.push('Premium');
      if (product.reviews >= 50) badges.push('Bestseller');

      return {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image_url,
        category: product.category,
        farmerName: product.farmer_id?.farm_name || product.farmer_id?.name,
        rating: product.rating || 0,
        reviewCount: product.reviews || 0,
        badges: badges.length > 0 ? badges : ['New'],
        originalPrice: product.price > 300 ? Math.round(product.price * 1.2) : null
      };
    });

    res.json(productsWithBadges);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/dashboard/categories - Get available categories
router.get('/categories', async (req, res) => {
  try {
    // Define standard categories
    const standardCategories = ['Vegetables', 'Fruits', 'Flowers', 'Grains', 'Honey', 'Others'];

    res.json(standardCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ status: 'active' });
    const organicProducts = await Product.countDocuments({
      status: 'active',
      category: /organic/i
    });
    const avgPriceResult = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]);
    const avgPrice = avgPriceResult.length > 0 ? Math.round(avgPriceResult[0].avgPrice) : 0;

    const totalFarmers = await User.countDocuments({ role: 'farmer', status: 'active' });

    // Today's orders (assuming created_at is a Date)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todaysOrders = await Order.countDocuments({
      created_at: { $gte: today, $lt: tomorrow }
    });

    res.json({
      totalProducts,
      organicProducts,
      avgPrice,
      totalFarmers,
      todaysOrders
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
