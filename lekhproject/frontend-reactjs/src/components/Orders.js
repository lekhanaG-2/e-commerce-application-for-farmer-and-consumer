import React, { useState, useEffect } from 'react';
import { farmerAPI } from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await farmerAPI.getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await farmerAPI.updateOrderStatus(orderId, newStatus);

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId ? {...order, status: newStatus} : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  // Load orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="orders-container">
        <h2>Orders</h2>
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <h2>Orders</h2>
        <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h2>Orders</h2>
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
          No orders found
        </div>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Consumer</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order._id || `order-${index}`}>
                <td>{order.products?.[0]?.name || 'Product'}</td>
                <td>{order.products?.[0]?.quantity || 0} kg</td>
                <td>{order.consumerId?.name || 'Customer'}</td>
                <td>{formatCurrency(order.totalAmount)}</td>
                <td>
                  <span className={`status ${order.status?.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Orders;
