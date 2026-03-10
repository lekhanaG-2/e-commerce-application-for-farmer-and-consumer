import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import { FaLeaf, FaShoppingCart, FaHeart } from 'react-icons/fa';
import { FaSearch, FaUser } from 'react-icons/fa';
import { consumerAPI } from '../services/api';
import { useWishlist } from '../contexts/WishlistContext';

const Navbar = ({ wishlistItems, propCartItems, propUserProfile, onLogout, searchTerm, onSearchChange }) => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const parsedUser = userString ? JSON.parse(userString) : null;
  const user = parsedUser && parsedUser.id ? parsedUser : null;

  // Use global wishlist context
  const { getWishlistCount } = useWishlist();

  const displayWishlistCount = getWishlistCount();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="consumer-nav">
      <div className="nav-container">
        <div className="nav-left">
          <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <FaLeaf className="logo-icon" />
            <span className="logo-text">Farm2Home</span>
          </div>
          <div className="search-container">
            <FaSearch size={18} className="search-icon" />
            <input type="text" placeholder="Search for fresh vegetables, fruits, and more..." className="search-input" value={searchTerm} onChange={onSearchChange} />
          </div>
          <div className="nav-links">
            <Link to="/products" className="nav-link">Products</Link>
            <Link to="/special-order" className="nav-link">Special Orders</Link>
            <Link to="/farmers" className="nav-link">Farmers</Link>
            <Link to="/about-us" className="nav-link">About Us</Link>
            <Link to="/contact" className="nav-link contact-link">Contact</Link>
          </div>
        </div>
        <div className="nav-right">
          <div className="nav-actions">
            <div className="nav-wishlist-icon" onClick={() => navigate('/wishlist')}>
              <FaHeart size={20} />
              <span className="wishlist-count">{displayWishlistCount}</span>
            </div>
            <div className="cart-icon" onClick={() => navigate('/cart')}>
              <FaShoppingCart size={22} />
              <span className="cart-count">{propCartItems?.length || 0}</span>
            </div>
            {user ? (
              <Link to="/account" className="nav-link">Account</Link>
            ) : (
              <Link to="/login" className="nav-link">Sign In</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
