import React from 'react';
import { FaUser } from 'react-icons/fa';
import './AdminLayout.css';

const AdminLayout = ({ children, onLogout, onProfileClick }) => {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    }
  };

  return (
    <div className="admin-layout">
      {/* Main Content */}
      <main className="admin-main-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;