import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminAPI as api } from '../services/api';
import './AdminDashboard.css';
import AdminLayout from './AdminLayout';
import ReactPaginate from 'react-paginate';
import {
  FaUsers, FaShoppingCart, FaDollarSign, FaExclamationTriangle, FaChartLine, FaBox, FaUser, FaCog, FaBell, FaSearch, FaEye, FaEdit, FaTrash, FaCheck, FaTimes, FaStar, FaCalendar, FaMapMarker, FaPhone, FaEnvelope, FaPlus, FaSync, FaDownload, FaArrowUp, FaArrowDown, FaHome, FaMoon, FaSun, FaSort, FaSortUp, FaSortDown, FaSpinner
} from 'react-icons/fa';
import { dummyFarmers, dummyConsumers, dummyOrders, dummyEarnings, dummyMessages, dummyNotifications } from '../data/dummyData';
import { dummyProducts } from '../data/dummyProducts';


const AdminDashboard = ({ onLogout, onProfileClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication and admin role
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || !user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
  }, [navigate]);


const [activeSection, setActiveSection] = useState('dashboard');

  const [stats, setStats] = useState({});
  const [farmers, setFarmers] = useState([]);
  const [consumers, setConsumers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [earnings, setEarnings] = useState({});
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    dateRange: 'all',
    location: 'all',
    category: 'all',
    status: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('adminDarkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Configuration constants
  const ITEMS_PER_PAGE = 10;

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(ITEMS_PER_PAGE);

  // Sorting states
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Messages & Notifications states
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeMessageTab, setActiveMessageTab] = useState('messages'); // 'messages' or 'notifications'
  const [notificationFilter, setNotificationFilter] = useState('all'); // 'all', 'unread', 'read'
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  // Settings states
  const [settings, setSettings] = useState(null);
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [settingsLoading, setSettingsLoading] = useState(false);

  // User dropdown states
  const [showUserDropdown, setShowUserDropdown] = useState(false);



  useEffect(() => {
    const section = location.pathname.split('/').pop() || 'dashboard';
    setActiveSection(section);
    setCurrentPage(0); // Reset page when switching sections
  }, [location.pathname]);

  useEffect(() => {
    if (activeSection === 'dashboard') {
      fetchStats();
      // Fetch real data for dashboard tables
      fetchFarmers();
      fetchConsumers();
      fetchOrders();
      fetchProducts();
    }
    else if (activeSection === 'farmers') {
      fetchFarmers();
    }
    else if (activeSection === 'consumers') {
      fetchConsumers();
    }
    else if (activeSection === 'orders') {
      fetchOrders();
    }
    else if (activeSection === 'products') {
      fetchProducts();
    }
    else if (activeSection === 'earnings') {
      fetchEarnings();
    }
    else if (activeSection === 'messages') {
      setMessages(dummyMessages);
      fetchNotifications();
      setError('');
    }
    else if (activeSection === 'settings') {
      if (!settings) {
        fetchSettings();
      }
      setError('');
    }
  }, [activeSection]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('adminDarkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Reusable filtering and sorting logic
  const createFilteredData = (data, searchFields = []) => {
    if (!Array.isArray(data)) return [];

    let filtered = data.filter(item => {
      const matchesSearch = debouncedSearchTerm === '' ||
        searchFields.some(field => item[field]?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));

      const matchesLocation = filters.location === 'all' || item.location?.toLowerCase() === filters.location;
      const matchesStatus = filters.status === 'all' ||
        (filters.status === 'verified' && item.verified) ||
        (filters.status === 'pending' && !item.verified) ||
        (filters.status === 'active' && item.status === 'active') ||
        (filters.status === 'inactive' && item.status === 'inactive');

      return matchesSearch && matchesLocation && matchesStatus;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  };

  const filteredFarmers = useMemo(() =>
    createFilteredData(farmers, ['name', 'email', 'location']),
    [farmers, debouncedSearchTerm, filters, sortConfig]
  );

  const filteredConsumers = useMemo(() =>
    createFilteredData(consumers, ['name', 'email']),
    [consumers, debouncedSearchTerm, filters, sortConfig]
  );

  const filteredOrders = useMemo(() =>
    createFilteredData(orders, ['id', 'farmerName', 'consumerName']),
    [orders, debouncedSearchTerm, filters, sortConfig]
  );

  const filteredProducts = useMemo(() =>
    createFilteredData(products, ['name', 'farmerName', 'category']),
    [products, debouncedSearchTerm, filters, sortConfig]
  );

  // Pagination data
  const paginatedFarmers = filteredFarmers?.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage) || [];
  const paginatedConsumers = filteredConsumers?.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage) || [];
  const paginatedOrders = filteredOrders?.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage) || [];
  const paginatedProducts = filteredProducts?.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage) || [];

  // Sort handler
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Action handlers
  const handleView = (type, id) => {
    // For now, just show details. Could open modal in future
    alert(`Viewing ${type} details for ID: ${id}`);
  };

  const handleEdit = (type, id) => {
    // For now, just show message. Could open edit form in future
    alert(`Edit functionality for ${type} with ID: ${id} - Feature coming soon`);
  };

  // Cleanup function for useEffect
  useEffect(() => {
    return () => {
      // Cleanup any timers or subscriptions
      setCurrentPage(0);
      setSortConfig({ key: null, direction: 'asc' });
    };
  }, []);

  const handleDelete = async (type, id) => {
    if (window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
      try {
        setIsLoading(true);
        if (type === 'farmer') {
          await api.deleteFarmer(id);
          setFarmers(farmers.filter(f => f.id !== id));
        } else if (type === 'consumer') {
          await api.deleteConsumer(id);
          setConsumers(consumers.filter(c => c.id !== id));
        } else if (type === 'product') {
          await api.deleteProduct(id);
          setProducts(products.filter(p => p.id !== id));
        } else if (type === 'order') {
          await api.deleteOrder(id);
          setOrders(orders.filter(o => o.id !== id));
        }
        alert(`${type} deleted successfully`);
      } catch (error) {
        alert(`Failed to delete ${type}: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerify = async (type, id) => {
    try {
      setIsLoading(true);
      if (type === 'farmer') {
        await api.updateFarmerStatus(id, 'active');
        setFarmers(farmers.map(f => f._id === id ? {...f, status: 'active', verified: true} : f));
        alert('Farmer verified successfully');
      }
    } catch (error) {
      alert(`Failed to verify ${type}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlock = async (type, id) => {
    try {
      setIsLoading(true);
      const newStatus = 'blocked';
      if (type === 'farmer') {
        await api.updateFarmerStatus(id, newStatus);
        setFarmers(farmers.map(f => f._id === id ? {...f, status: newStatus} : f));
      } else if (type === 'consumer') {
        await api.updateConsumerStatus(id, newStatus);
        setConsumers(consumers.map(c => c._id === id ? {...c, status: newStatus} : c));
      }
      alert(`${type} blocked successfully`);
    } catch (error) {
      alert(`Failed to block ${type}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessage = (type, id) => {
    // For now, just show message. Could open messaging interface in future
    alert(`Messaging functionality for ${type} with ID: ${id} - Feature coming soon`);
  };

  const handleUpdateStatus = async (type, id) => {
    const newStatus = prompt(`Enter new status for ${type}:`);
    if (newStatus) {
      try {
        setIsLoading(true);
        if (type === 'order') {
          await api.updateOrderStatus(id, newStatus);
          setOrders(orders.map(o => o._id === id ? {...o, status: newStatus} : o));
        } else if (type === 'product') {
          await api.updateProductStatus(id, newStatus);
          setProducts(products.map(p => p._id === id ? {...p, status: newStatus} : p));
        }
        alert(`${type} status updated successfully`);
      } catch (error) {
        alert(`Failed to update ${type} status: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Pagination handler
  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  // Dark mode toggle
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // User dropdown handlers
  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleUserLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Call the logout handler if provided
    if (onLogout) {
      onLogout();
    }

    // Navigate to consumer dashboard
    navigate('/');

    setShowUserDropdown(false);
  };

  // Message handlers
  const handleSendMessage = () => {
    if (!selectedConversation || !newMessage.trim()) return;

    const message = {
      id: Date.now(),
      sender: 'admin',
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    setSelectedConversation(prev => ({
      ...prev,
      messages: [...prev.messages, message],
      lastMessage: newMessage,
      timestamp: new Date().toISOString(),
      unread: 0
    }));

    setMessages(prev => prev.map(conv =>
      conv.id === selectedConversation.id
        ? { ...conv, messages: [...conv.messages, message], lastMessage: newMessage, timestamp: new Date().toISOString(), unread: 0 }
        : conv
    ));

    setNewMessage('');
  };

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const fetchStats = async () => {
    try {
      const response = await api.getStats();
      console.log('Stats API response:', response);
      setStats(response.data || response);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to fetch stats');
    }
  };

  // Standardized API response handler
  const handleApiResponse = (response, dataKey) => {
    console.log('handleApiResponse called with:', { response: !!response, dataKey });

    if (!response) {
      throw new Error('No response received from server');
    }

    // Handle case where response is directly an array (axios sometimes unwraps it)
    if (Array.isArray(response)) {
      console.log('Response is directly an array, returning it');
      return response;
    }

    // Handle case where response.data exists
    if (response && typeof response === 'object' && 'data' in response) {
      console.log('Response has data property, type:', typeof response.data);

      if (Array.isArray(response.data)) {
        console.log('Response.data is an array, returning directly');
        return response.data;
      }

      if (response.data && typeof response.data === 'object') {
        if (dataKey && response.data[dataKey] && Array.isArray(response.data[dataKey])) {
          console.log(`Found ${dataKey} array in response.data, returning it`);
          return response.data[dataKey];
        }
        // If dataKey not found but response.data is an object, return it as-is
        console.log('Response.data is an object, returning as-is');
        return response.data;
      }
    }

    // If response is an object but no data property, return it as-is
    if (typeof response === 'object' && response !== null) {
      console.log('Response is an object without data property, returning as-is');
      return response;
    }

    // If nothing matches, return empty array
    console.log('No matching data structure found, returning empty array');
    return [];
  };

  const fetchFarmers = async () => {
    if (farmers.length > 0) return; // Prevent unnecessary re-fetching

    setIsLoading(true);
    try {
      const response = await api.getFarmers();
      const farmersData = handleApiResponse(response, 'farmers');
      console.log('Farmers data received:', farmersData);
      setFarmers(farmersData);
      setError('');
    } catch (err) {
      console.error('Error fetching farmers:', err.message);
      setError('Failed to fetch farmers data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConsumers = async () => {
    setIsLoading(true);
    try {
      const response = await api.getConsumers();
      const consumersData = handleApiResponse(response, 'consumers');
      setConsumers(consumersData);
      setError('');
    } catch (err) {
      console.error('Error fetching consumers:', err.message);
      setError('Failed to fetch consumers data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (orders.length > 0) return; // Prevent unnecessary re-fetching

    setIsLoading(true);
    try {
      const response = await api.getOrders();
      const ordersData = handleApiResponse(response, 'orders');
      console.log('Orders data received:', ordersData);
      setOrders(ordersData);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err.message);
      setError('Failed to fetch orders data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (products.length > 0) return; // Prevent unnecessary re-fetching

    setIsLoading(true);
    try {
      const response = await api.getProducts();
      const productsData = handleApiResponse(response, 'products');
      setProducts(productsData);
      setError('');
    } catch (err) {
      console.error('Error fetching products:', err.message);
      setError('Failed to fetch products data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEarnings = async () => {
    setIsLoading(true);
    try {
      const response = await api.getEarnings();
      setEarnings(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch earnings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const response = await api.getSettings();
      setSettings(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.getNotifications();
      setNotifications(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    }
  };

  const saveSettings = async () => {
    setSettingsLoading(true);
    try {
      await api.saveSettings(settings);
      alert('Settings saved successfully!');
      setError('');
    } catch (err) {
      alert('Failed to save settings');
      setError('Failed to save settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
            {/* Header with Filters/Search Bar */}
            <div className="dashboard-header">
              <div className="header-title">
                <h2><FaHome /> Dashboard Overview</h2>
              </div>
              <div className="header-actions">
                <div className="filters-search-section">
                  <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search dashboard..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="filters">
                    <select className="filter-select">
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 3 months</option>
                    </select>
                  </div>
                </div>
                <button className="btn-primary"><FaSync /> Refresh</button>
                <button className="btn-secondary"><FaDownload /> Export Report</button>
              </div>
            </div>

            {/* Top Statistics Cards */}
            <div className="stats-cards">
              <div className="stat-card gradient-primary">
                <div className="stat-icon-wrapper">
                  <FaUser className="stat-icon" />
                </div>
                <div className="stat-content">
                  <h3>Total Farmers</h3>
                  <p className="stat-number">{stats?.totalFarmers || 0}</p>
                  <span className="stat-change positive"><FaArrowUp /> +12%</span>
                </div>
              </div>
              <div className="stat-card gradient-success">
                <div className="stat-icon-wrapper">
                  <FaUsers className="stat-icon" />
                </div>
                <div className="stat-content">
                  <h3>Total Consumers</h3>
                  <p className="stat-number">{stats?.totalConsumers || 0}</p>
                  <span className="stat-change positive"><FaArrowUp /> +8%</span>
                </div>
              </div>
              <div className="stat-card gradient-warning">
                <div className="stat-icon-wrapper">
                  <FaShoppingCart className="stat-icon" />
                </div>
                <div className="stat-content">
                  <h3>Total Orders</h3>
                  <p className="stat-number">{stats?.totalOrders || 0}</p>
                  <span className="stat-change positive"><FaArrowUp /> +15%</span>
                </div>
              </div>
              <div className="stat-card gradient-danger">
                <div className="stat-icon-wrapper">
                  <FaDollarSign className="stat-icon" />
                </div>
                <div className="stat-content">
                  <h3>Total Earnings</h3>
                  <p className="stat-number">₹{stats?.totalEarnings || 0}</p>
                  <span className="stat-change positive"><FaArrowUp /> +20%</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
              <div className="section-header">
                <h3><FaChartLine /> Sales Trends & Analytics</h3>
                <div className="chart-controls">
                  <select className="time-selector">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 3 months</option>
                  </select>
                </div>
              </div>
              <div className="charts-grid">
                <div className="chart-card">
                  <div className="chart-header">
                    <h4>Sales Trend</h4>
                    <FaChartLine />
                  </div>
                  <div className="chart-placeholder">
                    <FaChartLine size={48} />
                    <p>Line chart showing sales trends over time</p>
                  </div>
                </div>
                <div className="chart-card">
                  <div className="chart-header">
                    <h4>Top Products</h4>
                    <FaBox />
                  </div>
                  <div className="chart-placeholder">
                    <FaBox size={48} />
                    <p>Bar chart of top-selling products</p>
                  </div>
                </div>
                <div className="chart-card">
                  <div className="chart-header">
                    <h4>User Distribution</h4>
                    <FaUsers />
                  </div>
                  <div className="chart-placeholder">
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '100px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', color: '#4CAF50' }}>👨‍🌾</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats?.totalFarmers || 0}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Farmers</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', color: '#2196F3' }}>🛒</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats?.totalConsumers || 0}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Consumers</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', color: '#FF9800' }}>📦</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats?.totalOrders || 0}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Orders</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tables Section - 2 tables in one row */}
            <div className="tables-section">
              <div className="table-container">
                <div className="table-header">
                  <h4><FaShoppingCart /> Recent Orders</h4>
                  <button className="btn-link">View All</button>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Farmer</th>
                      <th>Consumer</th>
                      <th>₹ Amount</th>
                      <th>Status</th>
                      <th><FaCalendar /> Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(orders || []).slice(0, 3).map(order => (
                      <tr key={order.id}>
                        <td><span className="order-id">#{order.id}</span></td>
                        <td>{order.farmerName || 'N/A'}</td>
                        <td>{order.consumerName || 'N/A'}</td>
                        <td><span className="amount">₹{order.totalAmount}</span></td>
                        <td><span className={`status-badge ${order.status?.toLowerCase()}`}>{order.status}</span></td>
                        <td>{order.date || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
              </table>
              <ReactPaginate
                previousLabel={'Previous'}
                nextLabel={'Next'}
                breakLabel={'...'}
                pageCount={Math.ceil(filteredOrders.length / itemsPerPage)}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageChange}
                containerClassName={'pagination'}
                activeClassName={'active'}
                forcePage={currentPage}
              />
            </div>
            </div>

            {/* Single Table Section - 1 table in one row */}
            <div className="single-table-section">
              <div className="table-container">
                <div className="table-header">
                  <h4><FaStar /> Top Farmers</h4>
                  <button className="btn-link">View All</button>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Rating</th>
                      <th>Verification</th>
                      <th>Total Earnings</th>
                      <th>Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(farmers || []).slice(0, 5).map(farmer => (
                      <tr key={farmer.id}>
                        <td>{farmer.name}</td>
                        <td>
                          <div className="rating">
                            <FaStar className="star" />
                            {farmer.rating || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <span className={`verification-badge ${farmer.verified ? 'verified' : 'pending'}`}>
                            {farmer.verified ? <FaCheck /> : <FaTimes />}
                            {farmer.verified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td><span className="earnings">₹{farmer.totalEarnings || 0}</span></td>
                        <td>{farmer.totalOrders || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notifications Feed - in next row */}
            <div className="notifications-section">
              <div className="section-header">
                <h3><FaBell /> Notifications Feed</h3>
                <button className="btn-link">View All</button>
              </div>
              <div className="notifications-list">
                <div className="notification-item">
                  <div className="notification-icon alert">
                    <FaExclamationTriangle />
                  </div>
                  <div className="notification-content">
                    <p><strong>Low Stock Alert:</strong> Tomatoes from Farm DEF are running low</p>
                    <span className="notification-time">10 minutes ago</span>
                  </div>
                </div>
                <div className="notification-item">
                  <div className="notification-icon complaint">
                    <FaBell />
                  </div>
                  <div className="notification-content">
                    <p><strong>New Complaint:</strong> Received from Consumer GHI about order #1234</p>
                    <span className="notification-time">15 minutes ago</span>
                  </div>
                </div>
                <div className="notification-item">
                  <div className="notification-icon new-product">
                    <FaPlus />
                  </div>
                  <div className="notification-content">
                    <p><strong>New Product:</strong> Farmer XYZ added Organic Tomatoes</p>
                    <span className="notification-time">2 minutes ago</span>
                  </div>
                </div>
                <div className="notification-item">
                  <div className="notification-icon order">
                    <FaShoppingCart />
                  </div>
                  <div className="notification-content">
                    <p><strong>New Order:</strong> Order #1234 placed by Consumer ABC</p>
                    <span className="notification-time">5 minutes ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'farmers':
        return (
          <div className="table-section">
            <div className="section-header">
              <h3><FaUser /> Farmers Management</h3>
              <div className="header-actions">
                <div className="search-bar">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search farmers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="filters">
                  <select value={filters.location} onChange={(e) => setFilters({...filters, location: e.target.value})}>
                    <option value="all">All Locations</option>
                    <option value="karnataka">Karnataka</option>
                    <option value="maharashtra">Maharashtra</option>
                  </select>
                  <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                    <option value="all">All Status</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th onClick={() => handleSort('name')} className="sortable">
                      Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                    </th>
                    <th><FaPhone /> Contact</th>
                    <th onClick={() => handleSort('location')} className="sortable">
                      <FaMapMarker /> Location {sortConfig.key === 'location' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                    </th>
                    <th onClick={() => handleSort('rating')} className="sortable">
                      <FaStar /> Rating {sortConfig.key === 'rating' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                    </th>
                    <th>Verification</th>
                    <th onClick={() => handleSort('status')} className="sortable">
                      Status {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(paginatedFarmers || []).map(farmer => (
                    <tr key={farmer.id}>
                      <td><span className="farmer-id">#{farmer.id}</span></td>
                      <td>
                        <div className="farmer-info">
                          <strong>{farmer.name}</strong>
                          <small>{farmer.email}</small>
                        </div>
                      </td>
                      <td>{farmer.contact}</td>
                      <td>{farmer.location}</td>
                      <td>
                        <div className="rating">
                          <FaStar className="star filled" />
                          {farmer.rating || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <span className={`verification-badge ${farmer.verified ? 'verified' : 'pending'}`}>
                          {farmer.verified ? <FaCheck /> : <FaTimes />}
                          {farmer.verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${farmer.status?.toLowerCase() || 'active'}`}>
                          {farmer.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn view"
                            title="View Details"
                            onClick={() => handleView('farmer', farmer.id)}
                            aria-label={`View details for farmer ${farmer.name}`}
                          >
                            <FaEye />
                          </button>
                          <button
                            className="action-btn edit"
                            title="Edit Farmer"
                            onClick={() => handleEdit('farmer', farmer.id)}
                            aria-label={`Edit farmer ${farmer.name}`}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="action-btn block"
                            title="Block Farmer"
                            onClick={() => handleBlock('farmer', farmer.id)}
                            aria-label={`Block farmer ${farmer.name}`}
                          >
                            <FaTimes />
                          </button>
                          <button
                            className="action-btn verify"
                            title="Verify Farmer"
                            onClick={() => handleVerify('farmer', farmer.id)}
                            aria-label={`Verify farmer ${farmer.name}`}
                          >
                            <FaCheck />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ReactPaginate
                previousLabel={'Previous'}
                nextLabel={'Next'}
                breakLabel={'...'}
                pageCount={Math.ceil((filteredFarmers?.length || 0) / itemsPerPage)}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageChange}
                containerClassName={'pagination'}
                activeClassName={'active'}
                forcePage={currentPage}
              />
            </div>
          </div>
        );
      case 'consumers':
        return (
          <div className="table-section">
            <div className="section-header">
              <h3><FaUsers /> Consumer Management</h3>
              <div className="header-actions">
                <div className="search-bar">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search consumers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="filters">
                  <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <select value={filters.dateRange} onChange={(e) => setFilters({...filters, dateRange: e.target.value})}>
                    <option value="all">All Time</option>
                    <option value="recent">Recent (30 days)</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th onClick={() => handleSort('name')} className="sortable">
                      Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                    </th>
                    <th><FaEnvelope /> Email</th>
                    <th><FaPhone /> Phone</th>
                    <th onClick={() => handleSort('joinDate')} className="sortable">
                      Join Date {sortConfig.key === 'joinDate' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                    </th>
                    <th onClick={() => handleSort('totalOrders')} className="sortable">
                      Orders {sortConfig.key === 'totalOrders' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                    </th>
                    <th onClick={() => handleSort('totalSpent')} className="sortable">
                      Total Spent {sortConfig.key === 'totalSpent' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                    </th>
                    <th onClick={() => handleSort('status')} className="sortable">
                      Status {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(paginatedConsumers || []).map(consumer => (
                    <tr key={consumer.id}>
                      <td><span className="consumer-id">#{consumer.id}</span></td>
                      <td>
                        <div className="consumer-info">
                          <strong>{consumer.name}</strong>
                          <small>Last login: {consumer.lastLogin || 'Never'}</small>
                        </div>
                      </td>
                      <td>{consumer.email}</td>
                      <td>{consumer.phone}</td>
                      <td>{consumer.joinDate ? new Date(consumer.joinDate).toLocaleDateString('en-IN') : 'N/A'}</td>
                      <td>
                        <span className="order-count">{consumer.totalOrders || 0}</span>
                      </td>
                      <td>
                        <span className="total-spent">₹{consumer.totalSpent || 0}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${consumer.status?.toLowerCase() || 'active'}`}>
                          {consumer.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn view" title="View Details">
                            <FaEye />
                          </button>
                          <button className="action-btn edit" title="Edit Consumer">
                            <FaEdit />
                          </button>
                          <button className="action-btn block" title="Block Consumer">
                            <FaTimes />
                          </button>
                          <button className="action-btn message" title="Send Message">
                            <FaEnvelope />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ReactPaginate
                previousLabel={'Previous'}
                nextLabel={'Next'}
                breakLabel={'...'}
                pageCount={Math.ceil(filteredConsumers.length / itemsPerPage)}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageChange}
                containerClassName={'pagination'}
                activeClassName={'active'}
                forcePage={currentPage}
              />
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="table-section">
            <div className="section-header">
              <h3><FaShoppingCart /> Order Management</h3>
              <div className="header-actions">
                <div className="search-bar">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="filters">
                  <select value={filters.dateRange} onChange={(e) => setFilters({...filters, dateRange: e.target.value})}>
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                  <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select value={filters.location} onChange={(e) => setFilters({...filters, location: e.target.value})}>
                    <option value="all">All Locations</option>
                    <option value="karnataka">Karnataka</option>
                    <option value="maharashtra">Maharashtra</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Farmer</th>
                    <th>Consumer</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th><FaCalendar /> Date</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(paginatedOrders || []).map(order => (
                    <tr key={order.id}>
                      <td><span className="order-id">#{order.id}</span></td>
                      <td>
                        <div className="farmer-info">
                          <strong>{order.farmerName || 'N/A'}</strong>
                          <small>{order.farmerLocation || ''}</small>
                        </div>
                      </td>
                      <td>
                        <div className="consumer-info">
                          <strong>{order.consumerName || 'N/A'}</strong>
                          <small>{order.consumerPhone || ''}</small>
                        </div>
                      </td>
                      <td>
                        <span className="item-count">{order.items ? order.items.length : 0} items</span>
                      </td>
                      <td><span className="amount">₹{order.totalAmount}</span></td>
                      <td>
                        <span className={`status-badge ${order.status?.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{order.date || 'N/A'}</td>
                      <td>
                        <span className={`payment-status ${order.paymentStatus?.toLowerCase() || 'pending'}`}>
                          {order.paymentStatus || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn view" title="View Details">
                            <FaEye />
                          </button>
                          <button className="action-btn edit" title="Edit Order">
                            <FaEdit />
                          </button>
                          <button className="action-btn update" title="Update Status">
                            <FaCheck />
                          </button>
                          <button className="action-btn message" title="Contact Customer">
                            <FaEnvelope />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'products':
        return (
          <div className="table-section">
            <div className="section-header">
              <h3><FaBox /> Product Oversight</h3>
              <div className="header-actions">
                <div className="search-bar">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="filters">
                  <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}>
                    <option value="all">All Categories</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="dairy">Dairy</option>
                    <option value="grains">Grains</option>
                  </select>
                  <select value={filters.location} onChange={(e) => setFilters({...filters, location: e.target.value})}>
                    <option value="all">All Locations</option>
                    <option value="karnataka">Karnataka</option>
                    <option value="maharashtra">Maharashtra</option>
                  </select>
                  <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Farmer</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Category</th>
                    <th>Sales</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(products || []).map(product => (
                    <tr key={product.id}>
                      <td><span className="product-id">#{product.id}</span></td>
                      <td>
                        <div className="product-info">
                          <strong>{product.name}</strong>
                          <small>{product.description || ''}</small>
                        </div>
                      </td>
                      <td>
                        <div className="farmer-info">
                          <strong>{product.farmerName || 'N/A'}</strong>
                          <small>{product.farmerLocation || ''}</small>
                        </div>
                      </td>
                      <td><span className="price">₹{product.price}</span></td>
                      <td>
                        <span className={`stock-indicator ${product.stock < 10 ? 'low' : 'good'}`}>
                          {product.stock || 0}
                        </span>
                      </td>
                      <td><span className="category-tag">{product.category}</span></td>
                      <td>
                        <span className="sales-count">{product.salesCount || 0}</span>
                      </td>
                      <td>
                        <div className="rating">
                          <FaStar className="star filled" />
                          {product.rating || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${product.status?.toLowerCase() || 'active'}`}>
                          {product.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn view" title="View Details">
                            <FaEye />
                          </button>
                          <button className="action-btn edit" title="Edit Product">
                            <FaEdit />
                          </button>
                          <button className="action-btn remove" title="Remove Product">
                            <FaTrash />
                          </button>
                          <button className="action-btn flag" title="Flag Product">
                            <FaTimes />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'earnings':
        return (
          <div className="earnings-section">
            <div className="section-header">
              <h3><FaDollarSign /> Earnings & Reports</h3>
              <div className="header-actions">
                <button className="btn-primary"><FaDownload /> Export Report</button>
              </div>
            </div>

            {/* Total Earnings Card */}
            <div className="stats-cards">
              <div className="stat-card gradient-success">
                <div className="stat-icon-wrapper">
                  <FaDollarSign className="stat-icon" />
                </div>
                <div className="stat-content">
                  <h3>Total Earnings</h3>
                  <p className="stat-number">₹{earnings?.totalEarnings?.toLocaleString() || 0}</p>
                  <span className="stat-change positive"><FaArrowUp /> +15%</span>
                </div>
              </div>
            </div>

            {/* Monthly Earnings Table */}
            <div className="table-container">
              <div className="table-header">
                <h4><FaChartLine /> Monthly Earnings</h4>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Earnings (₹)</th>
                    <th>Orders</th>
                    <th>Growth (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings?.monthlyEarnings?.map((month, index) => (
                    <tr key={index}>
                      <td>{month.month}</td>
                      <td><span className="amount">₹{month.earnings?.toLocaleString()}</span></td>
                      <td>{month.orders}</td>
                      <td>
                        <span className={`growth ${month.growth >= 0 ? 'positive' : 'negative'}`}>
                          {month.growth >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                          {Math.abs(month.growth)}%
                        </span>
                      </td>
                    </tr>
                  )) || []}
                </tbody>
              </table>
            </div>

            {/* Top Farmers Table */}
            <div className="table-container">
              <div className="table-header">
                <h4><FaStar /> Top Farmers</h4>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Farmer Name</th>
                    <th>Earnings (₹)</th>
                    <th>Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings?.topFarmers?.map((farmer, index) => (
                    <tr key={index}>
                      <td>{farmer.name}</td>
                      <td><span className="earnings">₹{farmer.earnings?.toLocaleString()}</span></td>
                      <td>{farmer.orders}</td>
                    </tr>
                  )) || []}
                </tbody>
              </table>
            </div>

            {/* Category Breakdown Table */}
            <div className="table-container">
              <div className="table-header">
                <h4><FaBox /> Category Breakdown</h4>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Earnings (₹)</th>
                    <th>Percentage (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings?.categoryBreakdown?.map((category, index) => (
                    <tr key={index}>
                      <td>{category.category}</td>
                      <td><span className="earnings">₹{category.earnings?.toLocaleString()}</span></td>
                      <td>{category.percentage}%</td>
                    </tr>
                  )) || []}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'messages':
        return (
          <div className="messages-section">
            <div className="section-header">
              <h3><FaBell /> Messages & Notifications</h3>
              <div className="header-actions">
                <div className="message-tabs">
                  <button
                    className={`tab-btn ${activeMessageTab === 'messages' ? 'active' : ''}`}
                    onClick={() => setActiveMessageTab('messages')}
                  >
                    Messages
                  </button>
                  <button
                    className={`tab-btn ${activeMessageTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveMessageTab('notifications')}
                  >
                    Notifications
                  </button>
                </div>
              </div>
            </div>

            {activeMessageTab === 'messages' ? (
              <div className="messages-content">
                <div className="section-header">
                  <h4><FaEnvelope /> Direct Messages</h4>
                  <div className="header-actions">
                    <div className="search-bar">
                      <FaSearch className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="filters">
                      <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                        <option value="all">All Status</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                      </select>
                      <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}>
                        <option value="all">All Types</option>
                        <option value="farmer">Farmers</option>
                        <option value="consumer">Consumers</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Sender</th>
                        <th>Type</th>
                        <th>Subject / Message</th>
                        <th><FaCalendar /> Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(messages || [])
                        .filter(message => {
                          const matchesSearch = searchTerm === '' ||
                            message.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            message.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesStatus = filters.status === 'all' ||
                            (filters.status === 'unread' && message.unread > 0) ||
                            (filters.status === 'read' && message.unread === 0);
                          const matchesType = filters.category === 'all' || message.type === filters.category;
                          return matchesSearch && matchesStatus && matchesType;
                        })
                        .map(message => (
                          <tr key={message.id} className={message.unread > 0 ? 'unread' : ''}>
                            <td>
                              <div className="sender-info">
                                <strong>{message.recipient}</strong>
                                <small>#{message.recipientId}</small>
                              </div>
                            </td>
                            <td>
                              <span className={`user-type-badge ${message.type}`}>
                                {message.type === 'farmer' ? <FaUser /> : <FaUsers />}
                                {message.type}
                              </span>
                            </td>
                            <td>
                              <div className="message-preview">
                                <p>{message.lastMessage}</p>
                                {message.unread > 0 && (
                                  <span className="unread-indicator">{message.unread} new</span>
                                )}
                              </div>
                            </td>
                            <td>{new Date(message.timestamp).toLocaleDateString()}</td>
                            <td>
                              <span className={`status-badge ${message.unread > 0 ? 'unread' : 'read'}`}>
                                {message.unread > 0 ? 'Unread' : 'Read'}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="action-btn reply"
                                  title="Reply"
                                  onClick={() => handleMessage(message.type, message.recipientId)}
                                >
                                  <FaEnvelope />
                                </button>
                                <button
                                  className="action-btn view"
                                  title="View Conversation"
                                  onClick={() => setSelectedConversation(message)}
                                >
                                  <FaEye />
                                </button>
                                {message.unread > 0 && (
                                  <button
                                    className="action-btn mark-read"
                                    title="Mark as Read"
                                    onClick={() => {
                                      setMessages(prev => prev.map(m =>
                                        m.id === message.id ? {...m, unread: 0} : m
                                      ));
                                    }}
                                  >
                                    <FaCheck />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="notifications-content">
                <div className="section-header">
                  <h4><FaBell /> System Notifications</h4>
                  <div className="header-actions">
                    <div className="search-bar">
                      <FaSearch className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="filters">
                      <select
                        value={notificationFilter}
                        onChange={(e) => setNotificationFilter(e.target.value)}
                        className="filter-select"
                      >
                        <option value="all">All Notifications</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                      </select>
                      <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}>
                        <option value="all">All Types</option>
                        <option value="low-stock">Low Stock</option>
                        <option value="new-order">New Order</option>
                        <option value="farmer-verification">Verification</option>
                        <option value="complaint">Complaint</option>
                        <option value="payment">Payment</option>
                      </select>
                    </div>
                    <button className="btn-secondary" onClick={() => {
                      setNotifications(prev => prev.map(n => ({...n, read: true})));
                    }}>
                      Mark All Read
                    </button>
                  </div>
                </div>
                <div className="notifications-feed">
                  {(notifications || [])
                    .filter(notification => {
                      const matchesSearch = searchTerm === '' ||
                        notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        notification.message?.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesFilter = notificationFilter === 'all' ||
                        (notificationFilter === 'unread' && !notification.read) ||
                        (notificationFilter === 'read' && notification.read);
                      const matchesType = filters.category === 'all' || notification.type === filters.category;
                      return matchesSearch && matchesFilter && matchesType;
                    })
                    .map(notification => (
                      <div key={notification.id} className={`notification-card ${!notification.read ? 'unread' : ''}`}>
                        <div className="notification-header">
                          <div className="notification-icon">
                            {notification.type === 'low-stock' && <FaExclamationTriangle />}
                            {notification.type === 'new-order' && <FaShoppingCart />}
                            {notification.type === 'farmer-verification' && <FaCheck />}
                            {notification.type === 'complaint' && <FaBell />}
                            {notification.type === 'payment' && <FaDollarSign />}
                          </div>
                          <div className="notification-meta">
                            <span className={`priority-badge ${notification.priority}`}>
                              {notification.priority}
                            </span>
                            <small>{new Date(notification.timestamp).toLocaleString()}</small>
                          </div>
                        </div>
                        <div className="notification-content">
                          <h5>{notification.title}</h5>
                          <p>{notification.message}</p>
                        </div>
                        <div className="notification-actions">
                          {!notification.read && (
                            <button
                              className="action-btn mark-read"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <FaCheck /> Mark as Read
                            </button>
                          )}
                          <button
                            className="action-btn view-details"
                            onClick={() => handleView(notification.type, notification.id)}
                          >
                            <FaEye /> View Details
                          </button>
                          {notification.type === 'farmer-verification' && (
                            <>
                              <button
                                className="action-btn approve"
                                onClick={() => handleVerify('farmer', notification.id)}
                              >
                                <FaCheck /> Approve
                              </button>
                              <button
                                className="action-btn reject"
                                onClick={() => handleBlock('farmer', notification.id)}
                              >
                                <FaTimes /> Reject
                              </button>
                            </>
                          )}
                          {notification.type === 'complaint' && (
                            <button
                              className="action-btn reply"
                              onClick={() => handleMessage('complaint', notification.id)}
                            >
                              <FaEnvelope /> Reply
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'settings':
        return (
          <div className="settings-section">
            <div className="section-header">
              <h3><FaCog /> System Settings</h3>
              <div className="header-actions">
                <button className="btn-primary" onClick={saveSettings} disabled={settingsLoading}>
                  <FaCheck /> {settingsLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button className="btn-secondary" onClick={() => alert('Settings reset to defaults')}>
                  <FaSync /> Reset to Default
                </button>
              </div>
            </div>

            {/* Settings Tabs */}
            <div className="settings-tabs">
              <button
                className={`settings-tab ${activeSettingsTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveSettingsTab('general')}
              >
                General
              </button>
              <button
                className={`settings-tab ${activeSettingsTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveSettingsTab('notifications')}
              >
                Notifications
              </button>
              <button
                className={`settings-tab ${activeSettingsTab === 'system' ? 'active' : ''}`}
                onClick={() => setActiveSettingsTab('system')}
              >
                System
              </button>
              <button
                className={`settings-tab ${activeSettingsTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveSettingsTab('security')}
              >
                Security
              </button>
            </div>

            {/* Settings Content */}
            <div className="settings-content">
              {settingsLoading ? (
                <div className="loading-spinner">
                  <FaSpinner className="spinner" /> Loading settings...
                </div>
              ) : !settings ? (
                <div className="error">Failed to load settings</div>
              ) : (
                <>
                  {activeSettingsTab === 'general' && (
                    <div className="settings-group">
                      <h4>General Settings</h4>
                      <div className="settings-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Site Name</label>
                            <input
                              type="text"
                              value={settings.general.siteName}
                              onChange={(e) => setSettings({
                                ...settings,
                                general: { ...settings.general, siteName: e.target.value }
                              })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Site Description</label>
                            <textarea
                              value={settings.general.siteDescription}
                              onChange={(e) => setSettings({
                                ...settings,
                                general: { ...settings.general, siteDescription: e.target.value }
                              })}
                              rows="3"
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Contact Email</label>
                            <input
                              type="email"
                              value={settings.general.contactEmail}
                              onChange={(e) => setSettings({
                                ...settings,
                                general: { ...settings.general, contactEmail: e.target.value }
                              })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Contact Phone</label>
                            <input
                              type="tel"
                              value={settings.general.contactPhone}
                              onChange={(e) => setSettings({
                                ...settings,
                                general: { ...settings.general, contactPhone: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Currency</label>
                            <select
                              value={settings.general.currency}
                              onChange={(e) => setSettings({
                                ...settings,
                                general: { ...settings.general, currency: e.target.value }
                              })}
                            >
                              <option value="INR">INR (₹)</option>
                              <option value="USD">USD ($)</option>
                              <option value="EUR">EUR (€)</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Timezone</label>
                            <select
                              value={settings.general.timezone}
                              onChange={(e) => setSettings({
                                ...settings,
                                general: { ...settings.general, timezone: e.target.value }
                              })}
                            >
                              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                              <option value="UTC">UTC</option>
                              <option value="America/New_York">America/New_York (EST)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === 'notifications' && (
                    <div className="settings-group">
                      <h4>Notification Settings</h4>
                      <div className="settings-form">
                        <div className="notification-settings">
                          <div className="setting-item">
                            <div className="setting-info">
                              <h5>Email Notifications</h5>
                              <p>Receive notifications via email</p>
                            </div>
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                checked={settings.notifications.emailNotifications}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  notifications: { ...settings.notifications, emailNotifications: e.target.checked }
                                })}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>
                          <div className="setting-item">
                            <div className="setting-info">
                              <h5>SMS Notifications</h5>
                              <p>Receive notifications via SMS</p>
                            </div>
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                checked={settings.notifications.smsNotifications}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  notifications: { ...settings.notifications, smsNotifications: e.target.checked }
                                })}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>
                          <div className="setting-item">
                            <div className="setting-info">
                              <h5>Push Notifications</h5>
                              <p>Receive push notifications in browser</p>
                            </div>
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                checked={settings.notifications.pushNotifications}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  notifications: { ...settings.notifications, pushNotifications: e.target.checked }
                                })}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>
                          <div className="setting-item">
                            <div className="setting-info">
                              <h5>New Order Alerts</h5>
                              <p>Get notified when new orders are placed</p>
                            </div>
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                checked={settings.notifications.newOrderAlerts}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  notifications: { ...settings.notifications, newOrderAlerts: e.target.checked }
                                })}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>
                          <div className="setting-item">
                            <div className="setting-info">
                              <h5>Low Stock Alerts</h5>
                              <p>Get notified when products are running low</p>
                            </div>
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                checked={settings.notifications.lowStockAlerts}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  notifications: { ...settings.notifications, lowStockAlerts: e.target.checked }
                                })}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>
                          <div className="setting-item">
                            <div className="setting-info">
                              <h5>Farmer Verification Alerts</h5>
                              <p>Get notified about farmer verification requests</p>
                            </div>
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                checked={settings.notifications.farmerVerificationAlerts}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  notifications: { ...settings.notifications, farmerVerificationAlerts: e.target.checked }
                                })}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>
                          <div className="setting-item">
                            <div className="setting-info">
                              <h5>Payment Alerts</h5>
                              <p>Get notified about payment transactions</p>
                            </div>
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                checked={settings.notifications.paymentAlerts}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  notifications: { ...settings.notifications, paymentAlerts: e.target.checked }
                                })}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === 'system' && (
                    <div className="settings-group">
                      <h4>System Settings</h4>
                      <div className="settings-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Maintenance Mode</label>
                            <div className="toggle-container">
                              <label className="toggle-switch">
                                <input
                                  type="checkbox"
                                  checked={settings.system.maintenanceMode}
                                  onChange={(e) => setSettings({
                                    ...settings,
                                    system: { ...settings.system, maintenanceMode: e.target.checked }
                                  })}
                                />
                                <span className="slider"></span>
                              </label>
                              <span className="toggle-label">
                                {settings.system.maintenanceMode ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          </div>
                        </div>
                        {settings.system.maintenanceMode && (
                          <div className="form-row">
                            <div className="form-group full-width">
                              <label>Maintenance Message</label>
                              <textarea
                                value={settings.system.maintenanceMessage}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  system: { ...settings.system, maintenanceMessage: e.target.value }
                                })}
                                rows="3"
                                placeholder="Enter maintenance message..."
                              />
                            </div>
                          </div>
                        )}
                        <div className="form-row">
                          <div className="form-group">
                            <label>Auto Backup</label>
                            <div className="toggle-container">
                              <label className="toggle-switch">
                                <input
                                  type="checkbox"
                                  checked={settings.system.autoBackup}
                                  onChange={(e) => setSettings({
                                    ...settings,
                                    system: { ...settings.system, autoBackup: e.target.checked }
                                  })}
                                />
                                <span className="slider"></span>
                              </label>
                              <span className="toggle-label">
                                {settings.system.autoBackup ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Backup Frequency</label>
                            <select
                              value={settings.system.backupFrequency}
                              onChange={(e) => setSettings({
                                ...settings,
                                system: { ...settings.system, backupFrequency: e.target.value }
                              })}
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Data Retention (days)</label>
                            <input
                              type="number"
                              min="30"
                              max="3650"
                              value={settings.system.dataRetention}
                              onChange={(e) => setSettings({
                                ...settings,
                                system: { ...settings.system, dataRetention: parseInt(e.target.value) }
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === 'security' && (
                    <div className="settings-group">
                      <h4>Security Settings</h4>
                      <div className="settings-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Session Timeout (minutes)</label>
                            <input
                              type="number"
                              min="5"
                              max="480"
                              value={settings.security.sessionTimeout}
                              onChange={(e) => setSettings({
                                ...settings,
                                security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                              })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Password Minimum Length</label>
                            <input
                              type="number"
                              min="6"
                              max="32"
                              value={settings.security.passwordMinLength}
                              onChange={(e) => setSettings({
                                ...settings,
                                security: { ...settings.security, passwordMinLength: parseInt(e.target.value) }
                              })}
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Two-Factor Authentication</label>
                            <div className="toggle-container">
                              <label className="toggle-switch">
                                <input
                                  type="checkbox"
                                  checked={settings.security.twoFactorAuth}
                                  onChange={(e) => setSettings({
                                    ...settings,
                                    security: { ...settings.security, twoFactorAuth: e.target.checked }
                                  })}
                                />
                                <span className="slider"></span>
                              </label>
                              <span className="toggle-label">
                                {settings.security.twoFactorAuth ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Login Attempts Limit</label>
                            <input
                              type="number"
                              min="3"
                              max="10"
                              value={settings.security.loginAttempts}
                              onChange={(e) => setSettings({
                                ...settings,
                                security: { ...settings.security, loginAttempts: parseInt(e.target.value) }
                              })}
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>IP Whitelist</label>
                            <div className="toggle-container">
                              <label className="toggle-switch">
                                <input
                                  type="checkbox"
                                  checked={settings.security.ipWhitelist}
                                  onChange={(e) => setSettings({
                                    ...settings,
                                    security: { ...settings.security, ipWhitelist: e.target.checked }
                                  })}
                                />
                                <span className="slider"></span>
                              </label>
                              <span className="toggle-label">
                                {settings.security.ipWhitelist ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <AdminLayout onLogout={onLogout} onProfileClick={onProfileClick}>
      <div className={`admin-dashboard-content ${darkMode ? 'dark-mode' : ''}`}>
        <div className="dashboard-content-wrapper">
          <nav className="sidebar" role="navigation" aria-label="Admin navigation">
            <div className="sidebar-header">
              <h2 className="sidebar-title">Admin Dashboard</h2>
              <div className="user-icon-container">
                <button
                  className="user-icon-btn"
                  onClick={toggleUserDropdown}
                  title="User Menu"
                >
                  👤
                </button>
                {showUserDropdown && (
                  <div className="user-dropdown">
                    <div className="user-details">
                      <div className="user-name">Admin User</div>
                      <div className="user-email">admin@example.com</div>
                    </div>
                    <button className="logout-btn" onClick={handleUserLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
            <ul>
              <li>
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className={activeSection === 'dashboard' ? 'active' : ''}
                  aria-current={activeSection === 'dashboard' ? 'page' : undefined}
                >
                  <FaHome /> Dashboard Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('farmers')}
                  className={activeSection === 'farmers' ? 'active' : ''}
                  aria-current={activeSection === 'farmers' ? 'page' : undefined}
                >
                  <FaUser /> Farmers
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('consumers')}
                  className={activeSection === 'consumers' ? 'active' : ''}
                  aria-current={activeSection === 'consumers' ? 'page' : undefined}
                >
                  <FaUsers /> Consumers
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('orders')}
                  className={activeSection === 'orders' ? 'active' : ''}
                  aria-current={activeSection === 'orders' ? 'page' : undefined}
                >
                  <FaShoppingCart /> Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('products')}
                  className={activeSection === 'products' ? 'active' : ''}
                  aria-current={activeSection === 'products' ? 'page' : undefined}
                >
                  <FaBox /> Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('earnings')}
                  className={activeSection === 'earnings' ? 'active' : ''}
                  aria-current={activeSection === 'earnings' ? 'page' : undefined}
                >
                  <FaDollarSign /> Earnings & Reports
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('messages')}
                  className={activeSection === 'messages' ? 'active' : ''}
                  aria-current={activeSection === 'messages' ? 'page' : undefined}
                >
                  <FaBell /> Messages / Notifications
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('settings')}
                  className={activeSection === 'settings' ? 'active' : ''}
                  aria-current={activeSection === 'settings' ? 'page' : undefined}
                >
                  <FaCog /> Settings
                </button>
              </li>
            </ul>
            <div className="sidebar-footer">
              <button
                className="dark-mode-toggle"
                onClick={toggleDarkMode}
                aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
              >
                {darkMode ? <FaSun /> : <FaMoon />} {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </nav>
          <main className="main-panel" role="main">
            {isLoading && (
              <div className="loading-spinner" aria-live="polite">
                <FaSpinner className="spinner" /> Loading...
              </div>
            )}
            {error && (
              <div className="error" role="alert" aria-live="assertive">
                {error}
              </div>
            )}
            {renderContent()}
          </main>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
