const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials (assuming these exist in your database)
const testCredentials = {
  email: 'test@example.com',
  password: 'password123'
};

let authToken = '';

async function loginAndGetToken() {
  try {
    console.log('Logging in to get authentication token...');
    const loginResponse = await axios.post(`${BASE_URL}/users/login`, testCredentials);
    authToken = loginResponse.data.token;
    console.log('Login successful, token obtained\n');
    return true;
  } catch (error) {
    console.log('Login failed, testing with public endpoints only');
    console.log(`Error: ${error.response?.data?.error || error.message}\n`);
    return false;
  }
}

async function testEndpoints() {
  console.log('Testing API Endpoints...\n');

  // Try to login first
  const isLoggedIn = await loginAndGetToken();

  try {
    // Test public endpoints
    console.log('1. Testing GET /users (public endpoint)');
    const usersResponse = await axios.get(`${BASE_URL}/users`);
    console.log(`   Status: ${usersResponse.status}`);
    console.log(`   Users count: ${usersResponse.data.length}\n`);

    console.log('2. Testing GET /health (health check)');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Response: ${JSON.stringify(healthResponse.data)}\n`);

    console.log('3. Testing GET /products (public endpoint)');
    try {
      const productsResponse = await axios.get(`${BASE_URL}/products`);
      console.log(`   Status: ${productsResponse.status}`);
      console.log(`   Products count: ${productsResponse.data.length}\n`);
    } catch (error) {
      console.log(`   Status: ${error.response?.status || 'Error'}`);
      console.log(`   Message: ${error.response?.data?.error || error.message}\n`);
    }

    console.log('4. Testing GET /farmers (public endpoint)');
    try {
      const farmersResponse = await axios.get(`${BASE_URL}/farmers`);
      console.log(`   Status: ${farmersResponse.status}`);
      console.log(`   Farmers count: ${farmersResponse.data.length}\n`);
    } catch (error) {
      console.log(`   Status: ${error.response?.status || 'Error'}`);
      console.log(`   Message: ${error.response?.data?.error || error.message}\n`);
    }

    console.log('5. Testing GET /special-orders/offers (public endpoint)');
    try {
      const offersResponse = await axios.get(`${BASE_URL}/special-orders/offers`);
      console.log(`   Status: ${offersResponse.status}`);
      console.log(`   Offers count: ${offersResponse.data.length}\n`);
    } catch (error) {
      console.log(`   Status: ${error.response?.status || 'Error'}`);
      console.log(`   Message: ${error.response?.data?.error || error.message}\n`);
    }

    // Test protected endpoints
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

    console.log('6. Testing GET /special-orders (protected endpoint)');
    try {
      const specialOrdersResponse = await axios.get(`${BASE_URL}/special-orders`, { headers });
      console.log(`   Status: ${specialOrdersResponse.status}`);
      console.log(`   Special orders count: ${specialOrdersResponse.data.length}\n`);
    } catch (error) {
      console.log(`   Status: ${error.response?.status || 'Error'}`);
      console.log(`   Message: ${error.response?.data?.error || 'Authentication required'}\n`);
    }

    console.log('7. Testing GET /cart (protected endpoint)');
    try {
      const cartResponse = await axios.get(`${BASE_URL}/cart`, { headers });
      console.log(`   Status: ${cartResponse.status}`);
      console.log(`   Cart items count: ${cartResponse.data.length}\n`);
    } catch (error) {
      console.log(`   Status: ${error.response?.status || 'Error'}`);
      console.log(`   Message: ${error.response?.data?.error || 'Authentication required'}\n`);
    }

    console.log('8. Testing GET /wishlist (protected endpoint)');
    try {
      const wishlistResponse = await axios.get(`${BASE_URL}/wishlist`, { headers });
      console.log(`   Status: ${wishlistResponse.status}`);
      console.log(`   Wishlist items count: ${wishlistResponse.data.length}\n`);
    } catch (error) {
      console.log(`   Status: ${error.response?.status || 'Error'}`);
      console.log(`   Message: ${error.response?.data?.error || 'Authentication required'}\n`);
    }

    console.log('9. Testing GET /orders (protected endpoint)');
    try {
      const ordersResponse = await axios.get(`${BASE_URL}/orders`, { headers });
      console.log(`   Status: ${ordersResponse.status}`);
      console.log(`   Orders count: ${ordersResponse.data.length}\n`);
    } catch (error) {
      console.log(`   Status: ${error.response?.status || 'Error'}`);
      console.log(`   Message: ${error.response?.data?.error || 'Authentication required'}\n`);
    }

    console.log('10. Testing GET /dashboard (protected endpoint)');
    try {
      const dashboardResponse = await axios.get(`${BASE_URL}/dashboard`, { headers });
      console.log(`   Status: ${dashboardResponse.status}`);
      console.log(`   Dashboard data: ${JSON.stringify(dashboardResponse.data)}\n`);
    } catch (error) {
      console.log(`   Status: ${error.response?.status || 'Error'}`);
      console.log(`   Message: ${error.response?.data?.error || 'Authentication required'}\n`);
    }

    console.log('All endpoint tests completed!');

  } catch (error) {
    console.error('Error during testing:', error.message);
  }
}

testEndpoints();
