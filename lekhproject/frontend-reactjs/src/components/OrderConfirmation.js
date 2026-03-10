import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './OrderConfirmation.css';

const OrderConfirmation = ({ searchTerm, onSearchChange, userProfile, wishlistItems, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderData } = location.state || {};
  
  if (!orderData) {
    return <div>No order data found. <button onClick={() => navigate('/checkout')}>Go to Checkout</button></div>;
  }

  const { address, deliveryMethod, paymentMethod, total, cartItems, orderId, date } = orderData;
  const deliveryFee = deliveryMethod === 'express' ? 50 : 20;
  const getItemPrice = (item) => item.price || (item.product ? item.product.price : 0);
  const getItemName = (item) => item.name || (item.product ? item.product.name : 'Unknown Item');

  const handleContinueShopping = () => navigate('/');
  const handleViewOrderDetails = () => navigate('/orders');

  return (
    <>
      <Navbar
        wishlistItems={wishlistItems}
        propCartItems={[]}
        propUserProfile={userProfile}
        onLogout={onLogout}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />
      <div className="confirmation-page">
        <div className="hero-section">
          <div className="success-icon">✓</div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your purchase. Your order has been placed successfully.</p>
        </div>

        <div className="progress-tracker">
          <div className="progress-step completed">
            <div className="step-circle">1</div>
            <span>Cart</span>
          </div>
          <div className="progress-line completed"></div>
          <div className="progress-step completed">
            <div className="step-circle">2</div>
            <span>Checkout</span>
          </div>
          <div className="progress-line completed"></div>
          <div className="progress-step active">
            <div className="step-circle">3</div>
            <span>Order Placed</span>
          </div>
        </div>

        <div className="confirmation-content">
          <div className="order-summary">
            <div className="summary-header">
              <h2>Order Summary</h2>
              <div className="order-meta">
                <span>Order #{orderId}</span>
                <span>{date}</span>
              </div>
            </div>

            <div className="summary-grid">
              <div className="summary-section">
                <h3>Delivery Address</h3>
                <div className="address-info">
                  <p className="name">{address.fullName}</p>
                  <p>{address.addressLine1}{address.addressLine2 && `, ${address.addressLine2}`}</p>
                  <p>{address.city}, {address.state} {address.pincode}</p>
                  <p>📞 {address.phone}</p>
                </div>
              </div>

              <div className="summary-section">
                <h3>Delivery & Payment</h3>
                <div className="delivery-info">
                  <p><strong>Delivery:</strong> {deliveryMethod === 'standard' ? 'Standard (3–4 Days)' : 'Express (1–2 Days)'}</p>
                  <p><strong>Payment:</strong> {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod === 'upi' ? 'UPI / Google Pay / PhonePe' : 'Net Banking'}</p>
                </div>
              </div>
            </div>

            <div className="order-items">
              <h3>Items Ordered</h3>
              <div className="items-list">
                {cartItems.map(item => (
                  <div key={item.id || item.productId} className="item-row">
                    <div className="item-details">
                      <span className="item-name">{getItemName(item)}</span>
                      <span className="item-farmer">by {item.farmer}</span>
                    </div>
                    <div className="item-price">
                      ₹{getItemPrice(item)} x {item.quantity} = ₹{getItemPrice(item) * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-total">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹{cartItems.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0)}</span>
              </div>
              <div className="total-row">
                <span>Delivery Fee:</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="total-row total">
                <span>Total Paid:</span>
                <span>₹{total}</span>
              </div>
            </div>
          </div>

          <div className="confirmation-message">
            <div className="message-icon">📦</div>
            <h3>Your order is being processed</h3>
            <p>You'll receive updates via SMS and Email. Track your order for real-time updates.</p>
          </div>

          <div className="action-buttons">
            <button className="secondary-btn" onClick={handleContinueShopping}>
              Continue Shopping
            </button>
            <button className="primary-btn" onClick={handleViewOrderDetails}>
              Track Order
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderConfirmation;
