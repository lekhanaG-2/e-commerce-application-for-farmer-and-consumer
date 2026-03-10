const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function checkProducts() {
  try {
    console.log('Checking products API...');

    // Test the products endpoint
    const response = await axios.get(`${API_BASE_URL}/api/products`);
    console.log(`Products API returned ${response.data.length} products`);

    // Show first few products with their details
    response.data.slice(0, 5).forEach((product, index) => {
      console.log(`Product ${index + 1}:`, {
        id: product._id,
        name: product.name,
        category: product.category,
        product_type: product.product_type,
        status: product.status,
        farmer: product.farmer_id?.name || 'Unknown'
      });
    });

    // Count by product_type
    const typeCounts = response.data.reduce((acc, product) => {
      const type = product.product_type || 'undefined';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    console.log('Product type counts:', typeCounts);

  } catch (error) {
    console.error('Error checking products API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

checkProducts();
