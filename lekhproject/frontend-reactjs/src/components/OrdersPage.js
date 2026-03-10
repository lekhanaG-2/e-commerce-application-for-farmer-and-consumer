import React, { useState, useEffect } from 'react';
import { consumerAPI } from '../services/api';
import './OrdersPage.css';

const OrdersPage = ({ cartItems, setCartItems, userProfile, wishlistItems, searchTerm, onSearchChange }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await consumerAPI.getOrders();
        setOrders(data);
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 400)) {
          setError('Please log in to view your orders.');
          return;
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    try {
      await consumerAPI.updateOrderStatus(orderId, 'cancelled');
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: 'cancelled' } : order
      ));
      alert('Order cancelled successfully.');
    } catch (err) {
      alert('Error cancelling order: ' + err.message);
    }
  };

  const handleReorder = (order) => {
    try {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      const newCart = [...cartItems];
      items.forEach(item => {
        const existing = newCart.find(c => c.id === item.productId || c.id === item.id);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          newCart.push({
            id: item.productId || item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          });
        }
      });
      setCartItems(newCart);
      alert('Items added to cart!');
    } catch (err) {
      alert('Error reordering: ' + err.message);
    }
  };

  const toggleDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusBadge = (status) => {
    const classes = {
      pending: 'status-pending',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return <span className={`status-badge ${classes[status] || 'status-default'}`}>{status}</span>;
  };

  if (loading) return <div className="orders-page"><p>Loading orders...</p></div>;
  if (error) return <div className="orders-page"><p>Error: {error}</p></div>;

  return (
    <div className="orders-page">
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-summary">
                <div className="order-info">
                  <h3>Order #{order.id}</h3>
                  <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                  <p>Total: ₹{order.total}</p>
                  {getStatusBadge(order.status)}
                </div>
                <div className="order-actions">
                  <button onClick={() => toggleDetails(order.id)} className="details-btn">
                    {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
                  </button>
                  <button onClick={() => handleReorder(order)} className="reorder-btn">Reorder</button>
                  {order.status === 'pending' && (
                    <button onClick={() => handleCancel(order.id)} className="cancel-btn">Cancel</button>
                  )}
                </div>
              </div>
              {expandedOrder === order.id && (
                <div className="order-details">
                  <h4>Items:</h4>
                  <ul>
                    {(typeof order.items === 'string' ? JSON.parse(order.items) : order.items).map((item, index) => (
                      <li key={index}>
                        {item.name} - Quantity: {item.quantity} - Price: ₹{item.price}
                      </li>
                    ))}
                  </ul>
                  <p><strong>Total: ₹{order.total}</strong></p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
