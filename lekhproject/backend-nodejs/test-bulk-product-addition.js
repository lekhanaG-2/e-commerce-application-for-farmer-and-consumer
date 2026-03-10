const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Test bulk product addition
async function testBulkProductAddition() {
  try {
    // Create a test image file (you might need to create a dummy image)
    // For now, we'll test without an image

    const formData = new FormData();
    formData.append('name', 'Test Bulk Tomatoes');
    formData.append('price', '45.50');
    formData.append('quantity', '100');
    formData.append('category', 'Vegetables');
    formData.append('description', 'Fresh organic tomatoes for bulk orders');
    formData.append('minimumOrder', '10');
    formData.append('product_type', 'bulk');

    console.log('Testing bulk product addition...');
    console.log('Form data prepared with bulk product fields');

    const response = await axios.post('http://localhost:5000/api/farmers/products', formData, {
      headers: {
        ...formData.getHeaders(),
        // Note: In real scenario, would need Authorization header with JWT token
      }
    });

    console.log('✅ Bulk product added successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Error adding bulk product:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    console.error('Full error object:', error);
  }
}

testBulkProductAddition();