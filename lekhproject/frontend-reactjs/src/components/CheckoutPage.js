import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { consumerAPI } from '../services/api';
import './CheckoutPage.css';

const CheckoutPage = ({
  cartItems,
  userProfile,
  onBackToCart,
  onPlaceOrder,
  clearCart,
  wishlistItems,
  searchTerm,
  onSearchChange,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    fullName: 'John Doe',
    addressLine1: '123 Main St',
    addressLine2: '',
    city: 'Anytown',
    state: 'CA',
    pincode: '12345',
    phone: '+1 234 567 8900',
  });
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      await consumerAPI.addAddress({ address: `${address.addressLine1}${address.addressLine2 ? `, ${address.addressLine2}` : ''}, ${address.city}, ${address.state} ${address.pincode}` });
      setShowAddressModal(false);
      alert('Address saved successfully!');
    } catch (error) {
      alert('Failed to save address: ' + error.message);
    }
  };

  const getItemPrice = (item) => item.price || (item.product ? item.product.price : 0);
  const getItemName = (item) => item.name || (item.product ? item.product.name : 'Unknown Item');
  const getItemId = (item) => item.id || item.productId;

  const subtotal = cartItems.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);
  const deliveryCharge = deliveryMethod === 'express' ? 50 : 20;
  const total = subtotal + deliveryCharge;

  const handlePlaceOrder = async () => {
    if (window.confirm(`You are about to place an order for ₹${total}. Proceed?`)) {
      try {
        // Ensure address is added to user profile
        const addressString = `${address.addressLine1}${address.addressLine2 ? `, ${address.addressLine2}` : ''}, ${address.city}, ${address.state} ${address.pincode}`;
        await consumerAPI.addAddress({ address: addressString });

        // Transform cart items to match backend expected format
        const transformedItems = cartItems.map(item => ({
          productId: getItemId(item),
          product_id: getItemId(item),
          name: getItemName(item),
          quantity: item.quantity,
          price: getItemPrice(item)
        }));

        const orderData = {
          items: transformedItems,
          total,
          addressId: null, // Use default address (the one just added)
        };
        const response = await consumerAPI.placeOrder(orderData);
        const orderId = response.orderId;
        const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        const confirmationData = {
          address,
          deliveryMethod,
          paymentMethod,
          total,
          cartItems,
          orderId,
          date,
        };
        clearCart();
        navigate('/order-confirmation', { state: { orderData: confirmationData } });
      } catch (error) {
        alert('Failed to place order: ' + error.message);
      }
    }
  };

  return (
    <>
      <Navbar
        wishlistItems={wishlistItems}
        propCartItems={cartItems}
        propUserProfile={userProfile}
        onLogout={onLogout}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />
      <div className="checkout-page">
        <div className="checkout-container">

          <div className="left-column">
            <div className="card">
              <section className="section address-section">
                <h3>Delivery Address</h3>
                <div className="address-display">
                  <span className="address-name">{address.fullName}</span>
                  <span className="address-details">{address.addressLine1}{address.addressLine2 && `, ${address.addressLine2}`}, {address.city}, {address.state} {address.pincode}</span>
                  <span className="address-phone">Phone: {address.phone}</span>
                </div>
                <button className="change-address-btn" onClick={() => setShowAddressModal(true)}>
                  Change Address
                </button>
              </section>
            </div>

            <div className="card">
              <section className="section delivery-method-section">
                <h3>Delivery Method</h3>
                <label>
                  <input
                    type="radio"
                    name="delivery"
                    value="standard"
                    checked={deliveryMethod === 'standard'}
                    onChange={() => setDeliveryMethod('standard')}
                  />
                  <span className="option-icon">🚚</span>
                  Standard Delivery (₹20)
                </label>
                <label>
                  <input
                    type="radio"
                    name="delivery"
                    value="express"
                    checked={deliveryMethod === 'express'}
                    onChange={() => setDeliveryMethod('express')}
                  />
                  <span className="option-icon">⚡</span>
                  Express Delivery (₹50)
                </label>
              </section>
            </div>

            <div className="card">
              <section className="section payment-method-section">
                <h3>Payment Method</h3>
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <span className="option-icon">💰</span>
                  Cash on Delivery
                </label>
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <span className="option-icon">💳</span>
                  Credit/Debit Card
                </label>
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                  />
                  <span className="option-icon">📱</span>
                  UPI / Google Pay / PhonePe
                </label>
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="netbanking"
                    checked={paymentMethod === 'netbanking'}
                    onChange={() => setPaymentMethod('netbanking')}
                  />
                  <span className="option-icon">🏦</span>
                  Net Banking
                </label>
              </section>
            </div>
          </div>

          <div className="right-column">
            <div className="card">
              <section className="section order-summary-section">
                <h3>Order Summary</h3>
                <div className="order-items">
                  {cartItems.map(item => (
                    <div key={getItemId(item)} className="order-item">
                      {getItemName(item)} - ₹{getItemPrice(item) * item.quantity}
                    </div>
                  ))}
                </div>
                <div className="order-delivery">Delivery - ₹{deliveryCharge}</div>
                <div className="order-total"><strong>✅ Total: ₹{total}</strong></div>
                <div className="action-buttons">
                  <button className="back-button" onClick={onBackToCart}>Back to Cart</button>
                  <button className="place-order-button" onClick={handlePlaceOrder}>Place Order ✅</button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {showAddressModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Change Delivery Address</h3>
            <form className="address-form" onSubmit={handleSaveAddress}>
              <input name="fullName" value={address.fullName} onChange={handleAddressChange} placeholder="Full Name" required />
              <input name="addressLine1" value={address.addressLine1} onChange={handleAddressChange} placeholder="Address Line 1" required />
              <input name="addressLine2" value={address.addressLine2} onChange={handleAddressChange} placeholder="Address Line 2 (optional)" />
              <input name="city" value={address.city} onChange={handleAddressChange} placeholder="City" required />
              <input name="state" value={address.state} onChange={handleAddressChange} placeholder="State" required />
              <input name="pincode" value={address.pincode} onChange={handleAddressChange} placeholder="Pincode" required />
              <input name="phone" value={address.phone} onChange={handleAddressChange} placeholder="Phone Number" required />
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowAddressModal(false)}>❌ Cancel</button>
                <button type="submit">✅ Save Address</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutPage;
