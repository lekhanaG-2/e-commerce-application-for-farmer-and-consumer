import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './CartPage.css';

const CartPage = ({
  cartItems,
  setCartItems,
  wishlistItems,
  userProfile,
  searchTerm,
  onSearchChange,
  onLogout,
}) => {
  const navigate = useNavigate();

  const handleQuantityChange = (id, delta) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handleRemove = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = 20;
  const grandTotal = subtotal + delivery;

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
      <div className="cart-page">
        <h2>🧺 YOUR CART</h2>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map(item => (
              <tr key={item.id}>
                <td>{item.name} (Farmer: {item.farmer})</td>
                <td>₹{item.price}/kg</td>
                <td>
                  <button onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                  {' '}{item.quantity}{' '}
                  <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                </td>
                <td>₹{item.price * item.quantity}</td>
                <td><button onClick={() => handleRemove(item.id)}>❌</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="cart-summary">
          <p>Subtotal: ₹{subtotal}</p>
          <p>Delivery: ₹{delivery}</p>
          <hr />
          <p>✅ Grand Total: ₹{grandTotal}</p>
        </div>
        <div className="cart-actions">
          <button onClick={() => window.history.back()}>← Continue Shopping</button>
          <button onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
        </div>
      </div>
    </>
  );
};

export default CartPage;
