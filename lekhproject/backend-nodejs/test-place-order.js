const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testPlaceOrder() {
  let token, orderData;
  try {
    console.log('Testing order placement...');

    // First, login to get token
    const loginResponse = await axios.post(`${API_BASE_URL}/api/users/login`, {
      email: 'test@example.com', // Replace with a real test user email
      password: 'password123'    // Replace with real password
    });

    token = loginResponse.data.token;
    console.log('Login successful, token obtained');

    // First, add a verified address to the user
    console.log('Adding verified address to user...');
    await axios.post(`${API_BASE_URL}/api/users/add-address`, {
      address: '123 Test Street, Test City, 12345'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Wait a moment for address to be saved
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Now try to place an order
    orderData = {
      items: [
        {
          productId: '507f1f77bcf86cd799439011', // Replace with real product ID
          product_id: '507f1f77bcf86cd799439011', // Replace with real product ID
          name: 'Test Product',
          quantity: 1,
          price: 100
        }
      ],
      total: 120, // Including delivery
      addressId: null
    };

    console.log('Sending order data:', orderData);

    const orderResponse = await axios.post(`${API_BASE_URL}/api/orders`, orderData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error occurred:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);

    // Check if it's a 400 error and analyze the request
    if (error.response?.status === 400) {
      console.log('\n--- Debugging 400 Bad Request ---');
      console.log('Request URL:', `${API_BASE_URL}/api/orders`);
      console.log('Request method: POST');
      console.log('Request headers:', {
        'Authorization': `Bearer ${token ? token.substring(0, 20) + '...' : 'undefined'}`,
        'Content-Type': 'application/json'
      });
      console.log('Request body:', orderData);

      // Check if user has verified addresses
      console.log('\nChecking user verification status...');
      try {
        const userResponse = await axios.get(`${API_BASE_URL}/api/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('User profile:', userResponse.data);
        console.log('User addresses:', userResponse.data.addresses);
        console.log('Verified addresses:', userResponse.data.addresses?.filter(addr => addr.verified));
      } catch (userError) {
        console.log('Could not fetch user profile:', userError.response?.data);
      }
    }
  }
}

testPlaceOrder();
