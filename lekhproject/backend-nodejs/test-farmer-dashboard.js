const axios = require('axios');

async function testFarmerDashboard() {
  try {
    // First, login as a farmer to get token
    const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
      email: 'nandish@gmail.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('Logged in as farmer, token:', token);

    // Now call the dashboard API
    const dashboardResponse = await axios.get('http://localhost:5000/api/farmers/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Dashboard response:');
    console.log(JSON.stringify(dashboardResponse.data, null, 2));

  } catch (error) {
    console.error('Error testing farmer dashboard:', error.response?.data || error.message);
  }
}

testFarmerDashboard();
