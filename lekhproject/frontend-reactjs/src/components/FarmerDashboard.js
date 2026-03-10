import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './FarmerDashboard.css';
import {
  FaHome, FaBox, FaPlus, FaClipboardList, FaUser,
  FaChartLine, FaShoppingCart, FaSeedling, FaUserCircle, FaChevronDown,
  FaSignOutAlt, FaLeaf, FaSun, FaCloudRain, FaTractor, FaSpinner, FaMoneyBillWave
} from 'react-icons/fa';
import MyProducts from './MyProducts';
import AddProduct from './AddProducts';
import AddBulkProduct from './AddBulkProduct';
import Orders from './Orders';
import Profile from './Profile';
import Earnings from './Earnings';
import SpecialOrders from './SpecialOrders';
import { farmerAPI } from '../services/api';

const FarmerDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  // Check for hash in URL to set active section
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#addBulkProduct') {
      setActiveSection('addBulkProduct');
      window.location.hash = ''; // Clear the hash
    }
  }, []);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Farmer profile data - shared state
  const [farmerProfile, setFarmerProfile] = useState({
    name: '',
    farmType: '',
    location: '',
    phone: '',
    email: '',
    joinDate: '',
    totalProducts: 0,
    totalSales: 0,
    rating: 0
  });

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalSales: 0,
    recentOrders: [],
    topProducts: []
  });

  // Products state management
  const [products, setProducts] = useState([]);

  // Function to update profile data
  const updateProfile = (updatedProfile) => {
    setFarmerProfile(prevProfile => ({
      ...prevProfile,
      ...updatedProfile
    }));
  };

  // Function to add new product
  const addProduct = async (formData) => {
    try {
      const response = await farmerAPI.addProduct(formData);

      if (response.product) {
        setProducts(prevProducts => [...prevProducts, response.product]);
        // Refresh dashboard stats automatically
        await fetchDashboardStats();
        await fetchProducts(); // Refresh products list
      }

      return response;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  // Fetch farmer profile
  const fetchFarmerProfile = async () => {
    try {
      const profile = await farmerAPI.getProfile();
      console.log('Farmer profile received:', profile);

      setFarmerProfile({
        ...profile,
        joinDate: new Date(profile.createdAt || Date.now()).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        }),
        totalProducts: dashboardStats.totalProducts,
        totalSales: `$${dashboardStats.totalSales.toLocaleString()}`,
        rating: 4.8 // This could come from backend later
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');

      // Set default profile on error
      setFarmerProfile({
        name: 'Farmer',
        farmType: 'Unknown',
        location: 'Unknown',
        phone: 'N/A',
        email: 'N/A',
        joinDate: 'N/A',
        totalProducts: 0,
        totalSales: '$0',
        rating: 0
      });
    }
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const stats = await farmerAPI.getDashboardStats();
      console.log('Dashboard stats received:', stats);

      // Ensure we have proper data structure
      const processedStats = {
        totalProducts: stats.totalProducts || 0,
        totalOrders: stats.totalOrders || 0,
        totalSales: stats.totalSales || 0,
        recentOrders: stats.recentOrders || [],
        topProducts: stats.topProducts || []
      };

      setDashboardStats(processedStats);

      // Update farmer profile with stats
      setFarmerProfile(prevProfile => ({
        ...prevProfile,
        totalProducts: processedStats.totalProducts,
        totalSales: `$${processedStats.totalSales.toLocaleString()}`
      }));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard data');

      // Set default stats on error
      setDashboardStats({
        totalProducts: 0,
        totalOrders: 0,
        totalSales: 0,
        recentOrders: [],
        topProducts: []
      });
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const productsData = await farmerAPI.getProducts();
      console.log('Products data received:', productsData?.length || 0, 'products');
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products data');
      setProducts([]);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([
          fetchDashboardStats(),
          fetchFarmerProfile(),
          fetchProducts()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Listen for product added events to refresh dashboard
  useEffect(() => {
    const handleProductAdded = () => {
      console.log('Product added event received, refreshing dashboard...');
      fetchDashboardStats();
      fetchProducts();
    };

    window.addEventListener('productAdded', handleProductAdded);

    return () => {
      window.removeEventListener('productAdded', handleProductAdded);
    };
  }, []);

  const sidebarItems = [
    { id: 'dashboard', icon: FaHome, label: 'Dashboard' },
    { id: 'products', icon: FaBox, label: 'My Products' },
    { id: 'addProduct', icon: FaPlus, label: 'Add Product' },
    { id: 'addBulkProduct', icon: FaPlus, label: 'Add Bulk Product' },
    { id: 'specialOrders', icon: FaShoppingCart, label: 'Special Orders' },
    { id: 'orders', icon: FaClipboardList, label: 'Orders' },
    { id: 'earnings', icon: FaMoneyBillWave, label: 'Earnings' },
    { id: 'profile', icon: FaUser, label: 'Profile' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContent products={products} farmerProfile={farmerProfile} dashboardStats={dashboardStats} />;
      case 'products':
        return <MyProducts products={products} />;
      case 'addProduct':
        return <AddProduct onAddProduct={addProduct} />;
      case 'addBulkProduct':
        return <AddBulkProduct />;
      case 'specialOrders':
        return <SpecialOrders />;
      case 'orders':
        return <Orders />;
      case 'earnings':
        return <Earnings />;
      case 'profile':
        return <Profile profileData={farmerProfile} onUpdateProfile={updateProfile} />;
      default:
        return <DashboardContent products={products} farmerProfile={farmerProfile} dashboardStats={dashboardStats} />;
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleProfileClick = () => {
    setActiveSection('profile');
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');

    // Reload the page to reset the app state
    window.location.reload();
  };



  return (
    <div className="farmer-dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <FaLeaf className="logo-icon" />
            <h2>Farm2Home</h2>
          </Link>
        </div>
        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <div
              key={item.id}
              className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <item.icon className="sidebar-icon" />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="user-info" onClick={toggleUserMenu}>
            <FaUserCircle className="user-avatar clickable" />
            <div className="user-details">
              <span className="user-name">{farmerProfile.name}</span>
              <span className="user-role">Farmer</span>
            </div>
            <FaChevronDown className={`dropdown-arrow ${showUserMenu ? 'rotated' : ''}`} />
          </div>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="user-menu">
              <div className="user-menu-header">
                <FaUserCircle className="menu-avatar" />
                <div className="menu-user-info">
                  <h4>{farmerProfile.name}</h4>
                  <p>{farmerProfile.email}</p>
                </div>
              </div>
              <div className="user-menu-content">
                <div className="menu-item">
                  <span className="menu-label">Farm Type:</span>
                  <span className="menu-value">{farmerProfile.farmType}</span>
                </div>
                <div className="menu-item">
                  <span className="menu-label">Location:</span>
                  <span className="menu-value">{farmerProfile.location}</span>
                </div>
                <div className="menu-item">
                  <span className="menu-label">Phone:</span>
                  <span className="menu-value">{farmerProfile.phone}</span>
                </div>
                <div className="menu-item">
                  <span className="menu-label">Member Since:</span>
                  <span className="menu-value">{farmerProfile.joinDate}</span>
                </div>
                <div className="menu-stats">
                  <div className="stat-item">
                    <span className="stat-value">{farmerProfile.totalProducts}</span>
                    <span className="stat-label">Products</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{farmerProfile.totalSales}</span>
                    <span className="stat-label">Sales</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{farmerProfile.rating}★</span>
                    <span className="stat-label">Rating</span>
                  </div>
                </div>
              </div>
              <div className="user-menu-footer">
                <button className="menu-profile-btn" onClick={handleProfileClick}>
                  <FaUser /> View Full Profile
                </button>
                <button className="menu-logout-btn" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </div>
          )}
        </header>
        <div className="content-area">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent = ({ products, farmerProfile, dashboardStats }) => {
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get status color class
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'completed';
      case 'pending':
        return 'pending';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  return (
    <div className="dashboard-grid">
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon sales">
            <FaChartLine />
          </div>
          <div className="metric-info">
            <h4>Total Sales</h4>
            <span className="metric-value">{formatCurrency(dashboardStats.totalSales)}</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon orders">
            <FaShoppingCart />
          </div>
          <div className="metric-info">
            <h4>Orders</h4>
            <span className="metric-value">{dashboardStats.totalOrders}</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon products">
            <FaSeedling />
          </div>
          <div className="metric-info">
            <h4>Products</h4>
            <span className="metric-value">{dashboardStats.totalProducts}</span>
          </div>
        </div>
      </div>

      <div className="table-card">
        <h3>Recent Orders</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {dashboardStats.recentOrders && dashboardStats.recentOrders.length > 0 ? (
              dashboardStats.recentOrders.map((order, index) => (
                <tr key={order._id || index}>
                  <td>{order.products?.[0]?.name || 'Product'}</td>
                  <td>{order.consumerId?.name || 'Customer'}</td>
                  <td>{formatCurrency(order.totalAmount)}</td>
                  <td>
                    <span className={`status ${getStatusClass(order.status)}`}>
                      {order.status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: '#6b7280' }}>
                  No recent orders
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="chart-card">
        <h3>Top Selling Products</h3>
        <div className="top-products-list">
          {dashboardStats.topProducts && dashboardStats.topProducts.length > 0 ? (
            dashboardStats.topProducts.map((product, index) => (
              <div className="top-product-item" key={product._id || index}>
                <div className="product-rank">{index + 1}</div>
                <div className="product-details">
                  <div className="product-name">{product.name}</div>
                  <div className="product-stats">
                    <span className="quantity">Qty: {product.totalQuantitySold}</span>
                    <span className="revenue">${product.totalRevenue?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#6b7280' }}>
              No sales data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other sections
const ProductsContent = () => <div className="section-content"><h2>My Products</h2><p>Manage your products here.</p></div>;
const AddProductContent = () => <div className="section-content"><h2>Add Product</h2><p>Add new products to your store.</p></div>;
const OrdersContent = () => <div className="section-content"><h2>Orders</h2><p>View and manage orders.</p></div>;
const ProfileContent = () => <div className="section-content"><h2>Profile</h2><p>Update your profile information.</p></div>;

export default FarmerDashboard;
