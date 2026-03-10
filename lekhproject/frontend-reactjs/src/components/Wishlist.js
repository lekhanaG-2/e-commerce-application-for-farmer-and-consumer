import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Navbar';
import './Wishlist.css';
import { dummyProducts } from '../data/dummyProducts';
import { consumerAPI } from '../services/api';
import { useWishlist } from '../contexts/WishlistContext';

const Wishlist = ({ cartItems, searchTerm, onSearchChange, userProfile }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Use global wishlist context
  const { wishlistItems, removeFromWishlist, refreshWishlist } = useWishlist();

  // Remove old wishlist fetching logic - now using global context
  // The WishlistContext handles all the data fetching and state management
  useEffect(() => {
    // Set loading to false since context handles the data
    setLoading(false);
  }, []);

  const handleRemove = async (productId) => {
    await removeFromWishlist(productId);
  };

  if (loading) {
    return (
      <>
        <Navbar
          wishlistItems={wishlistItems}
          propCartItems={cartItems}
          propUserProfile={userProfile}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
        />
        <div className="loading">Loading wishlist...</div>
      </>
    );
  }

  return (
    <>
      <Navbar
        wishlistItems={wishlistItems}
        propCartItems={cartItems}
        propUserProfile={userProfile}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />
      <div className="wishlist-container">
        <div className="page-header">
          <h1 className="wishlist-title">❤️ Your Wishlist</h1>
          <p className="wishlist-subtitle">Here are the products you've saved for later.</p>
          {wishlistItems.length > 0 && (
            <p className="wishlist-count">You have {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist.</p>
          )}
        </div>
        <ToastContainer position="top-right" />
        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-icon">❤️</div>
            <h2>Your wishlist is empty</h2>
            <p>Start adding products you love to your wishlist!</p>
            <button onClick={() => navigate('/products')} className="btn-primary-large">
              Browse Products
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map(item => {
              // Handle both API response (item.product_id) and localStorage (full product object)
              const product = item.product_id || item;
              if (!product) return null;

              return (
                <div key={product.id} className="wishlist-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                    <div className="product-badges">
                      {product.isOrganic && <span className="badge organic">Organic</span>}
                      {product.isNew && <span className="badge new">New</span>}
                    </div>
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-farmer">by {product.farmerName}</p>
                    <div className="product-rating">
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`star ${i < product.rating ? 'filled' : ''}`}>★</span>
                        ))}
                      </div>
                      <span className="rating-text">({product.reviewCount})</span>
                    </div>
                    <div className="product-price">${product.price ? product.price.toFixed(2) : '0.00'} / {product.unit}</div>
                    <div className="wishlist-actions">
                      <button onClick={() => handleRemove(product.id)} className="btn-remove">
                        Remove
                      </button>
                      <button onClick={() => navigate('/cart')} className="btn-add-to-cart">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Wishlist;
