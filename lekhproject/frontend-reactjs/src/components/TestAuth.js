import React, { useState, useEffect } from 'react';
import { farmerAPI } from '../services/api';

const TestAuth = () => {
  const [authStatus, setAuthStatus] = useState('Checking...');
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      setToken(storedToken || 'No token found');

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      if (storedToken) {
        setAuthStatus('Token found in localStorage');
      } else {
        setAuthStatus('No token found - user needs to login');
      }
    } catch (error) {
      setAuthStatus('Error checking authentication: ' + error.message);
    }
  };

  const testFarmerAPI = async () => {
    try {
      setAuthStatus('Testing farmer API...');
      const response = await farmerAPI.getProfile();
      setAuthStatus('✅ Farmer API working - authenticated successfully');
      console.log('Farmer profile:', response);
    } catch (error) {
      setAuthStatus('❌ Farmer API failed: ' + (error.response?.data?.error || error.message));
      console.error('Farmer API error:', error);
    }
  };

  const testSpecialOrderAPI = async () => {
    try {
      setAuthStatus('Testing special order API...');
      const response = await farmerAPI.getSpecialOrders();
      setAuthStatus('✅ Special order API working - authenticated successfully');
      console.log('Special orders:', response);
    } catch (error) {
      setAuthStatus('❌ Special order API failed: ' + (error.response?.data?.error || error.message));
      console.error('Special order API error:', error);
    }
  };

  const testCreateSpecialOrder = async () => {
    try {
      setAuthStatus('Testing special order creation...');

      // Create test form data - ensure all required fields are included
      const formData = new FormData();
      formData.append('product_name', 'Test Product from Frontend');
      formData.append('description', 'Test description');
      formData.append('quantity', '10');
      formData.append('unit', 'kg');
      formData.append('price_per_unit', '50.00');
      formData.append('minimum_order', '1');
      formData.append('available_from', '2025-11-08');
      formData.append('available_until', '2025-11-15');
      formData.append('delivery_options', JSON.stringify(['home_delivery']));
      formData.append('payment_terms', 'Cash on delivery');
      formData.append('notes', 'Test notes');

      console.log('Creating special order with token:', localStorage.getItem('token'));
      const response = await farmerAPI.addSpecialOrder(formData);
      setAuthStatus('✅ Special order creation working!');
      console.log('Created special order:', response);
    } catch (error) {
      setAuthStatus('❌ Special order creation failed: ' + (error.response?.data?.error || error.message));
      console.error('Special order creation error:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('Cleared');
    setUser(null);
    setAuthStatus('Storage cleared - please login again');
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>🔍 Authentication Test Component</h3>

      <div style={{ marginBottom: '20px' }}>
        <h4>Authentication Status: {authStatus}</h4>
        <p><strong>Token:</strong> {token.length > 50 ? token.substring(0, 50) + '...' : token}</p>
        {user && (
          <div>
            <p><strong>User:</strong> {user.name} ({user.role})</p>
            <p><strong>ID:</strong> {user.id}</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={checkAuthentication} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Check Auth Status
        </button>

        <button onClick={testFarmerAPI} style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
          Test Farmer API
        </button>

        <button onClick={testSpecialOrderAPI} style={{ padding: '10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px' }}>
          Test Special Order API
        </button>

        <button onClick={testCreateSpecialOrder} style={{ padding: '10px', backgroundColor: '#fd7e14', color: 'white', border: 'none', borderRadius: '4px' }}>
          Test Create Special Order
        </button>

        <button onClick={clearStorage} style={{ padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
          Clear Storage
        </button>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h5>Instructions:</h5>
        <ol>
          <li>Login as a farmer first</li>
          <li>Click "Check Auth Status" to verify token</li>
          <li>Test the APIs to ensure authentication works</li>
          <li>If APIs fail, clear storage and login again</li>
        </ol>
      </div>
    </div>
  );
};

export default TestAuth;