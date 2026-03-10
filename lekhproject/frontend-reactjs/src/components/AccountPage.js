import React from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FaUser, FaShoppingCart, FaBell, FaCog, FaHeadset, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import ProfilePage from './ProfilePage';
import OrdersPage from './OrdersPage';
import NotificationsPage from './NotificationsPage';
import SettingsPage from './SettingsPage';
import HelpPage from './HelpPage';
import './AccountPage.css';

const AccountPage = ({ cartItems, setCartItems, userProfile, wishlistItems, searchTerm, onSearchChange, onLogout }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const section = searchParams.get('section') || 'profile';

  const token = localStorage.getItem('token');

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!user || !token) {
      navigate('/login');
    }
  }, [user, token, navigate]);

  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: <FaUser />, path: '/account?section=profile' },
    { id: 'orders', label: 'My Orders', icon: <FaShoppingCart />, path: '/account?section=orders' },
    { id: 'notifications', label: 'Notifications / Messages', icon: <FaBell />, path: '/account?section=notifications' },
    { id: 'settings', label: 'Settings', icon: <FaCog />, path: '/account?section=settings' },
    { id: 'help', label: 'Help & Support', icon: <FaHeadset />, path: '/account?section=help' }
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const renderContent = () => {
    switch (section) {
      case 'profile':
        return <ProfilePage cartItems={cartItems} setCartItems={setCartItems} userProfile={user} wishlistItems={wishlistItems} searchTerm={searchTerm} onSearchChange={onSearchChange} />;
      case 'orders':
        return <OrdersPage cartItems={cartItems} setCartItems={setCartItems} userProfile={user} wishlistItems={wishlistItems} searchTerm={searchTerm} onSearchChange={onSearchChange} />;
      case 'notifications':
        return <NotificationsPage cartItems={cartItems} setCartItems={setCartItems} userProfile={user} wishlistItems={wishlistItems} searchTerm={searchTerm} onSearchChange={onSearchChange} />;
      case 'settings':
        return <SettingsPage />;
      case 'help':
        return <HelpPage cartItems={cartItems} setCartItems={setCartItems} userProfile={user} wishlistItems={wishlistItems} searchTerm={searchTerm} onSearchChange={onSearchChange} />;
      default:
        return <ProfilePage cartItems={cartItems} setCartItems={setCartItems} userProfile={user} wishlistItems={wishlistItems} searchTerm={searchTerm} onSearchChange={onSearchChange} />;
    }
  };

  return (
    <div className="account-page">
      <div className="account-sidebar">
        <div className="user-info">
          <Link to="/" className="back-to-dashboard">
            ← Back to Dashboard
          </Link>
          <div className="user-avatar">
            <FaUser size={40} />
          </div>
          <h3>{user?.name || 'User'}</h3>
          <p>{user?.phone || 'Phone Number'}</p>
          {user?.email_verified && user?.phone_verified && (
            <span className="verified-badge">✅ Verified</span>
          )}
        </div>
        <nav className="account-nav">
          {menuItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              className={`nav-item ${section === item.id ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          <button className="nav-item logout-item" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </nav>
      </div>
      <div className="account-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AccountPage;
