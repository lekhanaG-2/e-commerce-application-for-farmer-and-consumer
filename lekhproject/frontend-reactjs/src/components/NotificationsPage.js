import React, { useState, useEffect } from 'react';
import { consumerAPI } from '../services/api';
import './NotificationsPage.css';

const NotificationsPage = ({ cartItems, setCartItems, userProfile, wishlistItems, searchTerm, onSearchChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const notificationsData = await consumerAPI.getNotifications();
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const getTypeBadge = (type) => {
    const classes = {
      order: 'notification-order',
      offer: 'notification-offer',
      shipping: 'notification-shipping',
      general: 'notification-general'
    };
    return <span className={`notification-badge ${classes[type] || 'notification-default'}`}>{type}</span>;
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <h1>My Notifications</h1>
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-page">
        <h1>My Notifications</h1>
        <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <h1>My Notifications</h1>
      {notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <div key={notification._id} className={`notification-card ${!notification.read ? 'unread' : ''}`}>
              <div className="notification-header">
                <h3>{notification.title}</h3>
                {getTypeBadge(notification.type)}
                {!notification.read && <span className="unread-indicator">●</span>}
              </div>
              <p className="notification-message">{notification.message}</p>
              <p className="notification-date">{new Date(notification.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
