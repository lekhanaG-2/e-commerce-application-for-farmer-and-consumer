import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './ConsumerDashboard.css';
import {
  FaLeaf, FaShoppingCart, FaUser, FaSearch, FaStar,
  
  FaTruck, FaShieldAlt, FaLeaf as FaOrganic, FaDollarSign,
  FaClock, FaPhone, FaEnvelope, FaMapMarkerAlt, FaLock, FaUndo
} from 'react-icons/fa';
import { Heart } from 'lucide-react';
import { consumerAPI, getProfile } from '../services/api';

const ConsumerDashboard = ({ onLogout, onViewWishlist, searchTerm, setCartItems, userProfile: propUserProfile, cartItems: propCartItems, onSearchChange, clearCart }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [user, setUser] = useState(null);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogout = () => {
    setDropdownVisible(false);
    onLogout();
  };

  const handleSellAsFarmer = () => {
    navigate('/farmer/register');
  };
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    const parsedUser = userString ? JSON.parse(userString) : null;
    setUser(parsedUser && parsedUser.id ? parsedUser : null);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchData = async () => {
      try {
        // Fetch featured products and categories from API
        const [featuredData, categoriesData] = await Promise.all([
          consumerAPI.getFeaturedProducts(),
          consumerAPI.getCategories()
        ]);

        // Transform products to ensure product_type defaults to 'regular'
        const transformedFeatured = featuredData.map(product => ({
          ...product,
          product_type: product.product_type || 'regular'
        }));

        // Limit to 6 products for featured section
        setFeaturedProducts(transformedFeatured.slice(0, 6));
        setCategories(categoriesData);

        // Try to get profile if token exists
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const profileData = await getProfile();
            setUserProfile(profileData);
          } catch (profileError) {
            console.error('Error fetching profile:', profileError);
            // Don't set error for profile failure, just continue without profile
          }
        }

        // Try to get wishlist if token exists
        if (token) {
          try {
            const wishlistData = await consumerAPI.getWishlistItems();
            setWishlistItems(wishlistData);
          } catch (wishlistError) {
            console.error('Error fetching wishlist:', wishlistError);
            // Don't set error for wishlist failure, just continue without wishlist
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
        if (error.response && error.response.status === 401) {
          // Token invalid, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUserProfile(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      setSearchResults(featuredProducts);
    } else {
      const filtered = featuredProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filtered);
    }
  }, [searchTerm, featuredProducts]);

  const addToCart = async (product) => {
    try {
      await consumerAPI.addToCart(1, product.id, 1);
      // Refresh cart items
      const updatedCart = await consumerAPI.getCartItems(1);
      setCartItems(updatedCart);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const toggleWishlist = async (productId) => {
    const isWishlisted = wishlistItems.some(item => item.product_id === productId);
    try {
      if (isWishlisted) {
        await consumerAPI.removeFromWishlist(productId);
        setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
      } else {
        await consumerAPI.addToWishlist(productId);
        // Assuming the API returns the added item, but for now add locally
        const newItem = { product_id: productId };
        setWishlistItems(prev => [...prev, newItem]);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const filteredProducts = searchResults.filter(product => {
    const productName = product.name || '';
    const search = searchTerm || '';
    const matchesSearch = productName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="loading">Loading your dashboard...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="consumer-dashboard">
      {/* Hero Section */}
      <section className="consumer-hero">
        <img
          src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTOtfy2pMk41_hbgCU1AkPmmhDDU6WplbLsSEWu918LXdAsFRTk"
          alt="Fresh produce"
          className="hero-image"
        />
        <div className="hero-overlay"></div>
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Fresh from Farm to Your Table
            </h1>
            <p className="hero-description">
              Bringing authentic, farm-fresh produce directly from local farmers to your doorstep.
              Every product is handpicked for quality, freshness, and authenticity.
              Fair pricing and convenient delivery make healthy eating easy for you.
            </p>
            <div className="hero-actions">
              <button className="btn-primary-large" onClick={() => navigate('/products')}>
                🛒 Shop Now
              </button>
              <button className="btn-secondary-large" onClick={() => navigate('/farmer/register')}>
                👨‍🌾 Sell as a Farmer
              </button>
            </div>
            <div className="hero-steps">
              <div className="hero-step-card">
                <div className="step-icon">
                  <FaShieldAlt size={28} color="white" />
                </div>
                <h3>Secures Payments</h3>
                <p>Free shipping on all your order</p>
              </div>
              <div className="hero-step-card">
                <div className="step-icon">
                  <FaPhone size={28} color="white" />
                </div>
                <h3>Customer Support 24/7</h3>
                <p>Instant access to Support</p>
              </div>
              <div className="hero-step-card">
                <div className="step-icon">
                  <FaLock size={28} color="white" />
                </div>
                <h3>100% Secure Payment</h3>
                <p>We ensure your money is save</p>
              </div>
              <div className="hero-step-card">
                <div className="step-icon">
                  <FaUndo size={28} color="white" />
                </div>
                <h3>Money-Back Guarantee</h3>
                <p>30 Days Money-Back Guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2 className="how-it-works-title">How It Works</h2>
        <hr className="how-it-works-divider" />
        <div className="how-it-works-steps">
          <div className="how-it-works-step">
            <div className="step-icon">
              <FaTruck size={28} color="white" />
            </div>
            <div className="step-content">
              <h3>Farmers List Fresh Produce</h3>
              <small>Local farmers upload their freshly harvested fruits, vegetables, and grains every day.</small>
            </div>
          </div>
          <div className="how-it-works-step">
            <div className="step-icon">
              <FaShieldAlt size={28} color="white" />
            </div>
            <div className="step-content">
              <h3>Quality Check & Packaging</h3>
              <small>We inspect every product for freshness and carefully pack it to ensure quality and safety.</small>
            </div>
          </div>
          <div className="how-it-works-step">
            <div className="step-icon">
              <FaLeaf size={28} color="white" />
            </div>
            <div className="step-content">
              <h3>We Pick Up & Deliver</h3>
              <small>Our team collects the produce directly from farms and delivers it to your nearest hub.</small>
            </div>
          </div>
          <div className="how-it-works-step">
            <div className="step-icon">
              <FaClock size={28} color="white" />
            </div>
            <div className="step-content">
              <h3>Enjoy Farm-Fresh Food</h3>
              <small>Receive the freshest local produce right at your doorstep from farm to table, just as it should be.</small>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title categories-title">Shop by Category</h2>
            <p className="section-description">Explore our fresh categories</p>
          </div>
          <div className="categories-grid">
            {categories.map((category, index) => {
              // Default images for categories
              const defaultImages = {
                'Fruits': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3kfy4baAJJgK2yvbuFRoZk73WxdNHM4ISVw&s',
                'Vegetables': 'https://static.vecteezy.com/system/resources/previews/047/830/754/non_2x/fresh-organic-vegetables-including-bell-peppers-carrots-lettuce-broccoli-cauliflower-and-onions-isolated-on-a-white-background-png.png',
                'Flowers': 'https://w0.peakpx.com/wallpaper/501/181/HD-wallpaper-colourful-bouquet-blossoms-flowers-mixed-flowers-colourful.jpg',
                'Grains': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=300&q=80',
                'Milk Products': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80',
                'Honey': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=300&q=80',
                'Others': 'https://casamiatours.com/wp-content/uploads/2021/03/Schermata-2021-03-19-alle-19.31.44.png'
              };
              const image = defaultImages[category] || 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?auto=format&fit=crop&w=300&q=80';
              return (
                <div
                  key={index}
                  className="category-card"
                  onClick={() => navigate(`/products?category=${encodeURIComponent(category)}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="category-image">
                    <img src={image} alt={category} />
                  </div>
                  <h3 className="category-name">{category}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title featured-title">Featured Products</h2>
            <p className="section-description">Fresh from our local farmers</p>
            <button className="btn-view-all" onClick={() => navigate('/products')}>
              View All Products
            </button>
          </div>
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => navigate(`/product/${product.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  <div className="product-badges">
                    {product.badges && product.badges.map((badge, index) => {
                      let badgeClass = '';
                      if (badge === 'Fresh Today') badgeClass = 'badge fresh-today';
                      else if (badge === 'Organic') badgeClass = 'badge organic';
                      else if (badge === 'New') badgeClass = 'badge new';
                      else if (badge === 'Bestseller') badgeClass = 'badge bestseller';
                      else if (badge === 'Premium') badgeClass = 'badge premium';
                      return <span key={index} className={badgeClass}>{badge}</span>;
                    })}
                  </div>
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-farmer">by {product.farmerName}</p>
                  <div className="product-rating">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < Math.floor(product.rating) ? 'star filled' : 'star'} />
                      ))}
                    </div>
                    <span className="rating-text">({product.reviewCount})</span>
                  </div>
                  <div className="product-price">
                    <span className="price">₹{product.price}</span>
                    {product.originalPrice && <span className="original-price">₹{product.originalPrice}</span>}
                  </div>
                  <button
                    className="btn-add-to-cart"
                    onClick={() => addToCart(product)}
                  >
                    <FaShoppingCart /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title why-choose-title">Why Choose Farm2Home?</h2>
            <p className="section-description">We're committed to quality and community</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaOrganic />
              </div>
              <h3>Fresh & Organic</h3>
              <p>Hand-picked fresh produce grown without harmful chemicals</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaDollarSign />
              </div>
              <h3>Fair Prices</h3>
              <p>Direct from farmers means better prices for you and fair pay for growers</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaLeaf />
              </div>
              <h3>Direct From Farmers</h3>
              <p>Support local farmers and get the freshest produce possible</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaClock />
              </div>
              <h3>Fast Delivery</h3>
              <p>Same-day or next-day delivery to ensure maximum freshness</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-us">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title mission-title">Our Mission</h2>
              <p className="section-description">
                Farm2Home connects conscious consumers with passionate local farmers.
                We believe in sustainable agriculture, fair trade, and building stronger communities
                through direct relationships between growers and consumers.
              </p>
              <div className="mission-points">
                <div className="mission-point">
                  <FaShieldAlt className="mission-icon" />
                  <span>Supporting local economies and sustainable farming practices</span>
                </div>
                <div className="mission-point">
                  <FaLeaf className="mission-icon" />
                  <span>Promoting organic and regenerative agriculture methods</span>
                </div>
                <div className="mission-point">
                  <FaUser className="mission-icon" />
                  <span>Building direct relationships between farmers and consumers</span>
                </div>
              </div>
            </div>
            <div className="about-visual">
              <div className="about-image">
                <img
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Local farmers working together"
                  className="about-logo"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title testimonials-title">What Our Customers Say</h2>
            <p className="section-description">Real feedback from real customers</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The quality of produce is incredible! Everything is so fresh and the farmers are so passionate about what they do."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <strong>Sarah Johnson</strong>
                  <span>Verified Customer</span>
                </div>
                <div className="author-rating">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="star filled" />
                  ))}
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"I love knowing exactly where my food comes from. The transparency and direct connection to farmers makes all the difference."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <strong>Mike Chen</strong>
                  <span>Verified Customer</span>
                </div>
                <div className="author-rating">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="star filled" />
                  ))}
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"Fast delivery and amazing quality. My family has never eaten better! Supporting local farmers feels great too."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <strong>Emily Rodriguez</strong>
                  <span>Verified Customer</span>
                </div>
                <div className="author-rating">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="star filled" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info">
              <h2 className="section-title">Get in Touch</h2>
              <p className="section-description">Have questions? We're here to help!</p>
              <div className="contact-details">
                <div className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <span>support@farm2home.com</span>
                </div>
                <div className="contact-item">
                  <FaPhone className="contact-icon" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <span>123 Farm Street, Agriculture City</span>
                </div>
              </div>
            </div>
            <div className="contact-form">
              <form>
                <div className="form-group">
                  <input type="text" placeholder="Your Name" />
                </div>
                <div className="form-group">
                  <input type="email" placeholder="Your Email" />
                </div>
                <div className="form-group">
                  <textarea placeholder="Your Message" rows="5"></textarea>
                </div>
                <button type="submit" className="btn-primary-large">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="consumer-footer">
        <div className="footer-content">
          <div className="footer-section footer-logo-section">
            <Link to="/" className="footer-logo">
              <FaLeaf className="logo-icon" />
              <span className="logo-text">Farm2Home</span>
            </Link>
            <p className="footer-description">
              Connecting you with local farmers for the freshest produce.
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">For Consumers</h4>
            <ul className="footer-links">
              <li><a href="#products">Shop Products</a></li>
              <li><a href="#how-it-works">How it Works</a></li>
              <li><a href="#delivery">Delivery Info</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">For Farmers</h4>
            <ul className="footer-links">
              <li><a href="#register">Register as Farmer</a></li>
              <li><a href="#sell">Sell Your Produce</a></li>
              <li><a href="#farmer-support">Farmer Support</a></li>
              <li><a href="#resources">Resources</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Account</h4>
            <ul className="footer-links">
              <li><a href="#profile">My Profile</a></li>
              <li><a href="#orders">Order History</a></li>
              <li><a href="#wishlist">Wishlist</a></li>
              <li><a href="#support">Support</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Contact</h4>
            <div className="contact-info">
              <p>📧 support@farm2home.com</p>
              <p>📞 +1 (555) 123-4567</p>
              <p>📍 123 Farm Street, Agriculture City</p>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Farm2Home. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default ConsumerDashboard;
