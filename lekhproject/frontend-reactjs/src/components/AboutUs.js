import React from 'react';
import { Link } from 'react-router-dom';
import './ConsumerDashboard.css'; // Reuse footer and general styles
import { FaLeaf } from 'react-icons/fa';

const heroImage = '/hero-image.jpg'; // Hero image from public folder

const AboutUs = ({ wishlistItems, cartItems, userProfile, onLogout, searchTerm, onSearchChange }) => {
  return (
    <>
      
      {/* Hero Banner with Overlay Text on Image */}
      <section className="hero-banner" style={{
        position: 'relative',
        height: '60vh',
        backgroundImage: `url(${heroImage})`,
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
          backgroundColor: 'rgba(46, 125, 50, 0.6)', // Semi-transparent green overlay for readability
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'relative',
          zIndex: 1,
          padding: '2rem',
          maxWidth: '60%',
          marginLeft: '2rem'
        }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '700', color: 'white' }}>
            Welcome to Farm2Home
          </h1>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'white', marginBottom: '1rem' }}>
            An innovative e-commerce platform that bridges the gap between farmers and consumers. Our mission is simple — to bring fresh, authentic, and farm-direct produce to your doorstep while ensuring fair prices and recognition for farmers.
          </p>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'white' }}>
            We believe that farmers deserve better value for their hard work and that consumers deserve high-quality, chemical-free produce straight from the source. By eliminating the middlemen, we create a transparent and sustainable food system.
          </p>
        </div>
      </section>

      {/* Mission and Vision Cards */}
      <section className="mission-vision-section" style={{
        padding: '4rem 2rem',
        backgroundColor: 'white',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#2e7d32', fontSize: '2.5rem', marginBottom: '3rem' }}>
          Our Mission & Vision
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {/* Mission Card */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '2rem',
            borderRadius: '12px',
            borderLeft: '5px solid #2e7d32',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#2e7d32', fontSize: '2rem', marginBottom: '1rem' }}>
              🌱 Our Mission
            </h3>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: '#555' }}>
              To empower farmers with digital tools and provide consumers with access to genuine, traceable farm products.
            </p>
          </div>
          {/* Vision Card */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '2rem',
            borderRadius: '12px',
            borderLeft: '5px solid #2e7d32',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#2e7d32', fontSize: '2rem', marginBottom: '1rem' }}>
              🚜 Our Vision
            </h3>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: '#555' }}>
              To build a community where technology connects farms and families, fostering trust, sustainability, and a healthier lifestyle.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us" style={{
        padding: '4rem 2rem',
        backgroundColor: 'white',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#2e7d32', fontSize: '2.5rem', marginBottom: '2rem' }}>
          💚 Why Choose Us
        </h2>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            <li style={{
              backgroundColor: '#f8f9fa',
              padding: '2rem',
              borderRadius: '10px',
              borderLeft: '5px solid #2e7d32'
            }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2e7d32' }}>✅</span>
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Direct farmer-to-consumer model</strong>
              </div>
            </li>
            <li style={{
              backgroundColor: '#f8f9fa',
              padding: '2rem',
              borderRadius: '10px',
              borderLeft: '5px solid #2e7d32'
            }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2e7d32' }}>✅</span>
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Fair and transparent pricing</strong>
              </div>
            </li>
            <li style={{
              backgroundColor: '#f8f9fa',
              padding: '2rem',
              borderRadius: '10px',
              borderLeft: '5px solid #2e7d32'
            }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2e7d32' }}>✅</span>
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Seasonal and pre-order options</strong>
              </div>
            </li>
            <li style={{
              backgroundColor: '#f8f9fa',
              padding: '2rem',
              borderRadius: '10px',
              borderLeft: '5px solid #2e7d32'
            }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2e7d32' }}>✅</span>
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Verified farmers and produce quality</strong>
              </div>
            </li>
            <li style={{
              backgroundColor: '#f8f9fa',
              padding: '2rem',
              borderRadius: '10px',
              borderLeft: '5px solid #2e7d32'
            }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2e7d32' }}>✅</span>
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Real-time crop updates from the fields</strong>
              </div>
            </li>
            <li style={{
              backgroundColor: '#f8f9fa',
              padding: '2rem',
              borderRadius: '10px',
              borderLeft: '5px solid #2e7d32'
            }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2e7d32' }}>✅</span>
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Empowering local communities through direct trade</strong>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Image Gallery Placeholder */}
      <section className="image-gallery" style={{
        padding: '4rem 2rem',
        backgroundColor: '#f8f9fa',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#2e7d32', fontSize: '2.5rem', marginBottom: '2rem' }}>
          🧑‍🌾 Our Community
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {[
            { label: 'Farmer1', key: 'farmer', src: '/assets/farmer-photo.png' },
            { label: 'Crops', key: 'crops', src: '/assets/crops-photo.png' },
            { label: 'Consumer', key: 'consumer', src: '/assets/consumer-photo.png' }
          ].map((item) => (
            <div key={item.key} style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <img 
                src={item.src} 
                alt={item.label} 
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover'
                }} 
              />
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section" style={{
        padding: '4rem 2rem',
        backgroundColor: 'white',
        textAlign: 'center',
        borderTop: '1px solid #e0e0e0',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <h2 style={{ color: '#2e7d32', fontSize: '2.5rem', marginBottom: '1rem' }}>
          Together, let’s support our farmers and make healthy eating a way of life!
        </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'black' }}>❤️</p>
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

export default AboutUs;
