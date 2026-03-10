import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ConsumerDashboard.css'; // Reuse footer and general styles
import { FaLeaf, FaFacebook, FaInstagram, FaTwitter, FaWhatsapp } from 'react-icons/fa';

const ContactUs = ({ wishlistItems, cartItems, userProfile, onLogout, searchTerm, onSearchChange }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, console.log the data; later integrate with backend/email
    console.log('Form submitted:', formData);
    alert('Message sent! We will get back to you soon.');
    setFormData({ fullName: '', email: '', phone: '', message: '' });
  };

  return (
    <>
      {/* Hero Section with Image - Left Aligned */}
      <section style={{
        position: 'relative',
        height: '60vh',
        backgroundImage: `url('/hero-image.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        color: 'white',
        textAlign: 'left'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(46, 125, 50, 0.6)', // Semi-transparent green overlay
          zIndex: 1
        }} />
        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '2rem',
          maxWidth: '60%',
          marginLeft: '2rem'
        }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '700' }}>
            📞 Contact Us
          </h1>
          <p style={{ fontSize: '1.3rem', lineHeight: '1.6' }}>
            At Farm2Home, we’re building direct connections between farmers and families.
If you’d like to partner, collaborate, or simply know more,
drop us a message and our team will get back to you soon.
Together, let’s make fresh, fair, and local the new normal. 🌾
          </p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section style={{
        padding: '4rem 2rem',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          padding: '3rem',
          maxWidth: '1000px',
          width: '100%',
          display: 'flex',
          gap: '3rem',
          flexWrap: 'wrap'
        }}>
          {/* Left Column: Contact Form */}
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h2 style={{ color: '#2e7d32', fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              💬 Contact Form
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
                style={{
                  padding: '1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  width: '100%'
                }}
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  padding: '1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  width: '100%'
                }}
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number (optional)"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  padding: '1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  width: '100%'
                }}
              />
              <textarea
                name="message"
                placeholder="Message / Query"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                style={{
                  padding: '1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  resize: 'vertical',
                  width: '100%'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                Send Message 📨
              </button>
            </form>
          </div>

          {/* Right Column: Contact Info */}
          <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h3 style={{ color: '#2e7d32', fontSize: '1.8rem', marginBottom: '1rem', textAlign: 'center' }}>
              📞 Contact Info
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>✉️</span>
              <div>
                <p style={{ fontSize: '1.1rem', color: '#555', margin: 0 }}>
                  support@farm2home.com
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📱</span>
              <div>
                <p style={{ fontSize: '1.1rem', color: '#555', margin: 0 }}>
                  +91 98765 43210
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🏠</span>
              <div>
                <p style={{ fontSize: '1.1rem', color: '#555', margin: 0 }}>
                  Mysuru, Karnataka, India
                </p>
              </div>
            </div>
            <div>
              <h4 style={{ color: '#2e7d32', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                🌐 Follow Us
              </h4>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <a href="#" style={{ color: '#2e7d32', fontSize: '1.5rem', transition: 'color 0.3s' }}
                   onMouseOver={(e) => e.target.style.color = '#388e3c'}
                   onMouseOut={(e) => e.target.style.color = '#2e7d32'}>
                  <FaFacebook />
                </a>
                <a href="#" style={{ color: '#2e7d32', fontSize: '1.5rem', transition: 'color 0.3s' }}
                   onMouseOver={(e) => e.target.style.color = '#388e3c'}
                   onMouseOut={(e) => e.target.style.color = '#2e7d32'}>
                  <FaInstagram />
                </a>
                <a href="#" style={{ color: '#2e7d32', fontSize: '1.5rem', transition: 'color 0.3s' }}
                   onMouseOver={(e) => e.target.style.color = '#388e3c'}
                   onMouseOut={(e) => e.target.style.color = '#2e7d32'}>
                  <FaTwitter />
                </a>
                <a href="#" style={{ color: '#2e7d32', fontSize: '1.5rem', transition: 'color 0.3s' }}
                   onMouseOver={(e) => e.target.style.color = '#388e3c'}
                   onMouseOut={(e) => e.target.style.color = '#2e7d32'}>
                  <FaWhatsapp />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Reuse from ConsumerDashboard */}
      <footer className="consumer-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section footer-logo-section">
              <div className="footer-logo">
                <FaLeaf className="logo-icon" />
                <span className="logo-text">Farm2Home</span>
              </div>
              <p className="footer-description">
                Connecting you with local farmers for the freshest produce.
              </p>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/products">Products</Link></li>
                <li><Link to="/special-order">Special Orders</Link></li>
                <li><Link to="/about-us">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Privacy & Policy</h4>
              <ul className="footer-links">
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#shipping">Shipping Info</a></li>
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
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Farm2Home. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default ContactUs;
