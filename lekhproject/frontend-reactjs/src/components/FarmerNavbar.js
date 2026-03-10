import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './FarmerNavbar.css'; // Assuming you create this CSS file
import { FaLeaf, FaUser, FaSignOutAlt, FaBox, FaShoppingCart, FaCog } from 'react-icons/fa';

const FarmerNavbar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="farmer-nav">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/farmer/dashboard" className="nav-logo">
            <FaLeaf className="logo-icon" />
            <span className="logo-text">Farm2Home - Farmer</span>
          </Link>
        </div>
        <div className="nav-center">
          <div className="nav-menu">
            <div className="nav-item" onClick={() => navigate('/farmer/dashboard')}>
              <FaUser size={16} />
              <span>Dashboard</span>
            </div>
            <div className="nav-item" onClick={() => navigate('/farmer/dashboard')}>
              <FaBox size={16} />
              <span>My Products</span>
            </div>
            <div className="nav-item" onClick={() => navigate('/farmer/dashboard')}>
              <FaShoppingCart size={16} />
              <span>Orders</span>
            </div>
            <div className="nav-item" onClick={() => navigate('/farmer/dashboard')}>
              <FaCog size={16} />
              <span>Profile</span>
            </div>
          </div>
        </div>
        <div className="nav-right">
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default FarmerNavbar;
