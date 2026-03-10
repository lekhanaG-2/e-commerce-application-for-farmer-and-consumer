import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { farmerAPI, getImageUrl } from '../services/api';
import AddSpecialOrder from './AddSpecialOrder';
import './SpecialOrders.css';

const SpecialOrders = () => {
  const [specialOrders, setSpecialOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  useEffect(() => {
    fetchSpecialOrders();
  }, []);

  const fetchSpecialOrders = async () => {
    try {
      setLoading(true);
      const data = await farmerAPI.getSpecialOrders();
      console.log('Fetched special orders:', data);
      setSpecialOrders(data);
    } catch (error) {
      console.error('Error fetching special orders:', error);
      setError('Failed to load special orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrder = async (orderData) => {
    try {
      console.log('Adding special order:', orderData);
      const response = await farmerAPI.addSpecialOrder(orderData);
      console.log('Add special order response:', response);
      setShowAddForm(false);
      fetchSpecialOrders();
    } catch (error) {
      console.error('Error adding special order:', error);
      setError('Failed to add special order');
    }
  };

  const handleUpdateOrder = async (id, orderData) => {
    try {
      console.log('Updating special order:', id, orderData);
      const response = await farmerAPI.updateSpecialOrder(id, orderData);
      console.log('Update special order response:', response);
      setEditingOrder(null);
      fetchSpecialOrders();
    } catch (error) {
      console.error('Error updating special order:', error);
      setError('Failed to update special order');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to delete this special order?')) {
      try {
        console.log('Deleting special order:', id);
        const response = await farmerAPI.deleteSpecialOrder(id);
        console.log('Delete special order response:', response);
        fetchSpecialOrders();
      } catch (error) {
        console.error('Error deleting special order:', error);
        setError('Failed to delete special order');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      default:
        return 'status-inactive';
    }
  };

  if (loading) {
    return <div className="special-orders-loading">Loading special orders...</div>;
  }

  if (error) {
    return <div className="special-orders-error">{error}</div>;
  }

  return (
    <div className="special-orders">
      <div className="special-orders-header">
        <h2>Special Order Offers</h2>
        <button
          className="add-order-btn"
          onClick={() => setShowAddForm(true)}
        >
          Add New Offer
        </button>
      </div>

      {specialOrders.length === 0 ? (
        <div className="no-orders">
          <p>No special order offers yet. Create your first offer to attract customers!</p>
        </div>
      ) : (
        <div className="orders-grid">
          {specialOrders.map((order) => (
            <div key={order._id || order.id} className="order-card">
              <div className="order-header">
                {order.image && (
                  <img src={getImageUrl(order.image)} alt={order.product_name} className="order-image" />
                )}
                <h3>{order.product_name}</h3>
                <span className={`status ${getStatusClass(order.status)}`}>
                  {order.status || 'active'}
                </span>
              </div>

              <div className="order-details">
                <p className="description">{order.description}</p>
                <div className="order-meta">
                  <span className="price">₹{order.price_per_unit} per {order.unit}</span>
                  <span className="quantity">Qty: {order.quantity} {order.unit}</span>
                </div>
                {order.minimum_order && (
                  <span className="category">Min Order: {order.minimum_order}</span>
                )}
                {order.available_from && order.available_until && (
                  <span className="delivery-date">
                    Available: {formatDate(order.available_from)} - {formatDate(order.available_until)}
                  </span>
                )}
                {order.notes && (
                  <p className="notes">Notes: {order.notes}</p>
                )}
              </div>

              <div className="order-actions">
                <button
                  className="edit-btn"
                  onClick={() => setEditingOrder(order)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteOrder(order._id || order.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <AddSpecialOrder
          onSubmit={handleAddOrder}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingOrder && (
        <AddSpecialOrder
          order={editingOrder}
          onSubmit={(data) => handleUpdateOrder(editingOrder._id || editingOrder.id, data)}
          onCancel={() => setEditingOrder(null)}
        />
      )}
    </div>
  );
};

export default SpecialOrders;
