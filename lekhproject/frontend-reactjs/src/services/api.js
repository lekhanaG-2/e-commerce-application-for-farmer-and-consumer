import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
});

const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 seconds

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} for ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log('Response data type:', typeof response.data);
    console.log('Response data keys:', response.data && typeof response.data === 'object' ? Object.keys(response.data) : 'N/A');
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    console.error('Error response:', error.response);
    console.error('Error request:', error.request);
    console.error('Error message:', error.message);

    // Clear token on authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload(); // Reload to reset user state
    }
    // Silently handle API errors for fallback mechanisms
    return Promise.reject(error);
  }
);

const retryApi = async (apiCall, retries = MAX_RETRIES) => {
  try {
    return await apiCall();
  } catch (error) {
    if ((error.code === 'ERR_INSUFFICIENT_RESOURCES' || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') && retries > 0) {
      console.log(`API call failed with ${error.code}, retrying... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1))); // exponential backoff
      return retryApi(apiCall, retries - 1);
    }
    if (error.response && error.response.status === 429 && retries > 0) {
      console.log(`API rate limited (429), retrying... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1))); // exponential backoff
      return retryApi(apiCall, retries - 1);
    }
    throw error;
  }
};

export const consumerAPI = {
  getProfile: async (userId) => {
    const response = await retryApi(() => api.get(`/api/users/${userId}`));
    return response.data;
  },
  updateProfile: async (userId, profileData) => {
    const response = await retryApi(() => api.put(`/api/users/${userId}`, profileData));
    return response.data;
  },
  getProducts: async () => {
    const response = await retryApi(() => api.get(`/api/products`));
    return response.data;
  },
  getCartItems: async (userId) => {
    const response = await retryApi(() => api.get(`/api/cart/${userId}`));
    return response.data;
  },
  addToCart: async (userId, productId, quantity) => {
    const response = await retryApi(() => api.post(`/api/cart`, { userId, productId, quantity }));
    return response.data;
  },
  // Add searchProducts method
  searchProducts: async (query) => {
    const response = await retryApi(() => api.get(`/api/products`));
    return response.data.filter(product => product.name.toLowerCase().includes(query.toLowerCase()));
  },
  // Wishlist methods
  getWishlistItems: async () => {
    const response = await retryApi(() => api.get(`/api/wishlist`));
    return response.data;
  },
  addToWishlist: async (productId) => {
    const response = await retryApi(() => api.post(`/api/wishlist`, { productId }));
    return response.data;
  },
  removeFromWishlist: async (productId) => {
    const response = await retryApi(() => api.delete(`/api/wishlist/${productId}`));
    return response.data;
  },
  getProductById: async (id) => {
    const response = await retryApi(() => api.get(`/api/products/${id}`));
    return response.data;
  },

  // Orders methods
  getOrders: async () => {
    const response = await retryApi(() => api.get('/api/orders'));
    return response.data;
  },

  placeOrder: async (orderData) => {
    const response = await retryApi(() => api.post('/api/orders', orderData));
    return response.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await retryApi(() => api.put(`/api/orders/${orderId}/status`, { status }));
    return response.data;
  },

  getAddresses: async () => {
    const response = await retryApi(() => api.get('/api/addresses'));
    return response.data;
  },

  addAddress: async (addressData) => {
    const response = await retryApi(() => api.post('/api/users/add-address', addressData));
    return response.data;
  },

  // Dashboard methods
  getFeaturedProducts: async () => {
    const response = await retryApi(() => api.get('/api/dashboard/featured-products'));
    return response.data;
  },

  getCategories: async () => {
    const response = await retryApi(() => api.get('/api/dashboard/categories'));
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await retryApi(() => api.get('/api/dashboard/stats'));
    return response.data;
  },

  getNotifications: async () => {
    const response = await retryApi(() => api.get('/api/users/notifications'));
    return response.data;
  }
};

// Farmer API methods
export const farmerAPI = {
  getProfile: async () => {
    const response = await retryApi(() => api.get('/api/farmers/profile'));
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await retryApi(() => api.put('/api/farmers/profile', profileData));
    return response.data;
  },
  getProducts: async () => {
    const response = await retryApi(() => api.get('/api/farmers/products'));
    return response.data;
  },
  addProduct: async (productData) => {
    const response = await retryApi(() => api.post('/api/farmers/products', productData));
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await retryApi(() => api.get('/api/farmers/dashboard'));
    return response.data;
  },
  getOrders: async () => {
    const response = await retryApi(() => api.get('/api/farmers/orders'));
    return response.data;
  },
  updateOrderStatus: async (orderId, status) => {
    const response = await retryApi(() => api.put(`/api/farmers/orders/${orderId}/status`, { status }));
    return response.data;
  },
  getEarnings: async () => {
    const response = await retryApi(() => api.get('/api/farmers/earnings'));
    return response.data;
  },
  getSpecialOrders: async () => {
    const response = await retryApi(() => api.get('/api/special-orders/farmer/special-orders'));
    return response.data;
  },
  addSpecialOrder: async (specialOrderData) => {
    const response = await retryApi(() => api.post('/api/special-orders/farmer/special-orders', specialOrderData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }));
    return response.data;
  },
  updateSpecialOrder: async (id, specialOrderData) => {
    const response = await retryApi(() => api.put(`/api/special-orders/farmer/special-orders/${id}`, specialOrderData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }));
    return response.data;
  },
  deleteSpecialOrder: async (id) => {
    const response = await retryApi(() => api.delete(`/api/special-orders/farmer/special-orders/${id}`));
    return response.data;
  }
};

// Admin API methods
export const adminAPI = {
  getStats: async () => {
    const response = await retryApi(() => api.get('/api/admin/stats'));
    return response.data;
  },
  getFarmers: async () => {
    const response = await retryApi(() => api.get('/api/admin/farmers'));
    return response.data;
  },
  getConsumers: async () => {
    const response = await retryApi(() => api.get('/api/admin/consumers'));
    return response.data;
  },
  getOrders: async () => {
    const response = await retryApi(() => api.get('/api/admin/orders'));
    return response.data;
  },
  getProducts: async () => {
    const response = await retryApi(() => api.get('/api/admin/products'));
    return response.data;
  },
  getEarnings: async () => {
    const response = await retryApi(() => api.get('/api/admin/earnings'));
    return response.data;
  },
  getSettings: async () => {
    const response = await retryApi(() => api.get('/api/admin/settings'));
    return response.data;
  },
  saveSettings: async (settings) => {
    const response = await retryApi(() => api.put('/api/admin/settings', { settings }));
    return response.data;
  },
  updateFarmerStatus: async (farmerId, status) => {
    const response = await retryApi(() => api.put(`/api/admin/farmers/${farmerId}/status`, { status }));
    return response.data;
  },
  updateConsumerStatus: async (consumerId, status) => {
    const response = await retryApi(() => api.put(`/api/admin/consumers/${consumerId}/status`, { status }));
    return response.data;
  },
  updateProductStatus: async (productId, status) => {
    const response = await retryApi(() => api.put(`/api/admin/products/${productId}/status`, { status }));
    return response.data;
  },
  updateOrderStatus: async (orderId, status) => {
    const response = await retryApi(() => api.put(`/api/admin/orders/${orderId}/status`, { status }));
    return response.data;
  },
  deleteFarmer: async (farmerId) => {
    const response = await retryApi(() => api.delete(`/api/admin/farmers/${farmerId}`));
    return response.data;
  },
  deleteConsumer: async (consumerId) => {
    const response = await retryApi(() => api.delete(`/api/admin/consumers/${consumerId}`));
    return response.data;
  },
  deleteProduct: async (productId) => {
    const response = await retryApi(() => api.delete(`/api/admin/products/${productId}`));
    return response.data;
  },
  deleteOrder: async (orderId) => {
    const response = await retryApi(() => api.delete(`/api/admin/orders/${orderId}`));
    return response.data;
  },
  getNotifications: async () => {
    const response = await retryApi(() => api.get('/api/admin/notifications'));
    return response.data;
  }
};

// Profile API functions
export const getProfile = () => retryApi(() => api.get('/api/users/profile'));

export const updateProfile = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (key !== 'photo' && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  if (data.photo) {
    formData.append('photo', data.photo);
  }
  return retryApi(() => api.put('/api/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }));
};

// Change password
export const changePassword = (passwordData) => retryApi(() => api.put('/api/users/change-password', passwordData));

// Update notification preferences
export const updateNotificationPreferences = (preferences) => retryApi(() => api.put('/api/users/profile', preferences));

// Submit contact form
export const submitContactForm = (contactData) => retryApi(() => api.post('/api/users/contact', contactData));

// Utility function to get correct image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If it's already a full URL, extract just the path part and use current API_BASE_URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // Extract the path after /uploads/, regardless of the host/port
    const urlParts = imagePath.split('/uploads/');
    if (urlParts.length > 1) {
      return `${API_BASE_URL}/uploads/${urlParts[1]}`;
    }
    return imagePath; // fallback
  }

  // If it's a relative path, construct full URL
  if (imagePath.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imagePath}`;
  }

  // If it doesn't start with /uploads/, assume it's just the filename
  return `${API_BASE_URL}/uploads/${imagePath}`;
};

export default api;
