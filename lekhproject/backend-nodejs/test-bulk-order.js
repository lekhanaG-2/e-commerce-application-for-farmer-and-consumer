const axios = require('axios');

// Test bulk order creation
async function testBulkOrder() {
  try {
    // Sample bulk order payload from frontend
    const payload = {
      customerId: 'u1', // This would be the actual user ID
      farmerId: '690cb719447d63459c103855', // Sample farmer ID
      items: [
        {
          productId: 'sample-product-1',
          productName: 'Tomatoes',
          qty: 10,
          unit: 'kg',
          price_per_unit: 50
        },
        {
          productId: 'sample-product-2',
          productName: 'Potatoes',
          qty: 5,
          unit: 'kg',
          price_per_unit: 30
        }
      ],
      eventType: 'Wedding',
      deliveryDate: '2025-12-15',
      deliveryAddress: '123 Main St, City, State',
      contactPhone: '9876543210',
      notes: 'Need fresh produce for wedding reception'
    };

    console.log('Testing bulk order creation...');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post('http://localhost:5000/api/special-orders', payload, {
      headers: {
        'Content-Type': 'application/json'
        // Note: In real scenario, would need Authorization header with JWT token
      }
    });

    console.log('✅ Bulk order created successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Error creating bulk order:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testBulkOrder();