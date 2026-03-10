const axios = require('axios');
const jwt = require('jsonwebtoken');
const FormData = require('form-data');

// JWT Secret from .env
const JWT_SECRET = '908fe188f7ed3fc4455e3170f419a2ce18ce3765dc421ec06e42c34cdf1b1bf7515f46aab9e3b3a5d3a57aac34d4dcdcc3f2e64bba112f09af12a3682948f75c';

// Farmer ID from database
const FARMER_ID = '690cb719447d63459c103855';

// Generate valid JWT token
const token = jwt.sign({ id: FARMER_ID, role: 'farmer' }, JWT_SECRET);
console.log('Generated JWT Token:', token);

// Test API call with valid token
async function testSpecialOrderCreation() {
  try {
    // Prepare form data
    const formData = new FormData();
    formData.append('product_name', 'Test Special Order');
    formData.append('description', 'This is a test special order offer');
    formData.append('quantity', '25');
    formData.append('unit', 'kg');
    formData.append('price_per_unit', '75.50');
    formData.append('minimum_order', '5');
    formData.append('available_from', '2025-11-10');
    formData.append('available_until', '2025-11-20');
    formData.append('delivery_options', JSON.stringify(['home_delivery', 'pickup']));
    formData.append('payment_terms', 'Cash on delivery');
    formData.append('notes', 'Fresh organic produce');

    console.log('Making API request to create special order offer...');

    const response = await axios.post('http://localhost:5000/api/special-orders/farmer/special-orders', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    console.log('✅ Success! Special order offer created:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Error creating special order offer:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Test token verification
function testTokenVerification() {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verification successful:');
    console.log('Decoded payload:', decoded);
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🔍 Testing JWT Token and Special Order API...\n');

  console.log('1. Testing token verification:');
  testTokenVerification();

  console.log('\n2. Testing special order creation:');
  await testSpecialOrderCreation();
}

runTests();