 import React, { useState, useEffect } from 'react';
 import './ProductsPage.css';
 import './ConsumerDashboard.css';  // Import footer styles from ConsumerDashboard
 import Navbar from './Navbar';
 import { FaLeaf, FaStar, FaShoppingCart } from 'react-icons/fa';
 import { GiFruitBowl, GiFlowerPot, GiHoneyJar, GiCarrot } from 'react-icons/gi';
 import { Heart } from 'lucide-react';
 import { ToastContainer, toast } from 'react-toastify';
 import 'react-toastify/dist/ReactToastify.css';
 import { useNavigate, useSearchParams } from 'react-router-dom';
 import { consumerAPI } from '../services/api';
 import { useWishlist } from '../contexts/WishlistContext';

const categoryOrder = [
  'Fruits',
  'Vegetables',
  'Flowers',
  'Grains',
  'Milk Products',
  'Honey',
  'Others'
];

// Default categories to show even when no products are available
const defaultCategories = categoryOrder;

const ProductsPage = ({ searchTerm, cartItems, setCartItems }) => {
  const [productsByCategory, setProductsByCategory] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null); // null means show all categories
  const [priceRange, setPriceRange] = useState([0, 100]); // min and max price, will be updated after fetch
  const [selectedFarmLocations, setSelectedFarmLocations] = useState([]);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState({}); // Changed to object for per-category pagination
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');
  const getProductsPerPage = (category) => ['Fruits', 'Vegetables', 'Flowers', 'Honey', 'Milk Products', 'Grains'].includes(category) ? 6 : 8;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Use global wishlist context
  const { addToWishlist, isInWishlist, wishlistItems } = useWishlist();

  const toggleWishlist = async (product) => {
    await addToWishlist(product);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const products = await consumerAPI.getProducts();
        // Transform API products to match expected structure
        const transformedProducts = products.map(product => ({
          id: product._id,
          name: product.name,
          farmerName: product.farmer?.name || product.farmer_id?.name || 'Unknown Farmer',
          farmLocation: product.farmer?.farm_name || product.farmer_id?.farm_name || product.farm || 'Unknown Location',
          rating: product.rating?.average || 4, // Use API rating if available
          reviewCount: product.rating?.count || 0, // Use API review count if available
          price: product.price,
          unit: product.unit,
          category: product.category,
          isOrganic: product.organic || false,
          isNew: false, // Default, API doesn't specify
          image: product.image_url ? `${process.env.REACT_APP_API_BASE_URL}${product.image_url}` : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
          description: product.description,
          quantity: product.quantity || product.stock_quantity,
          minimumOrder: product.minimumOrder || 0,
          product_type: product.product_type || 'regular' // Default to 'regular' if not set
        }));
        setAllProducts(transformedProducts);

        // Group by category
        const grouped = transformedProducts.reduce((acc, product) => {
          const category = product.category || 'Others';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(product);
          return acc;
        }, {});
        setProductsByCategory(grouped);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && categoryOrder.includes(categoryFromUrl)) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  const addToCart = (product) => {
    // For frontend-only, simulate add to cart without API
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      const updatedCart = cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCartItems(updatedCart);
    } else {
      setCartItems([...cartItems, { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        farmer: product.farmerName,
        unit: product.unit,
        quantity: 1 
      }]);
    }
    toast.success(
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
        <div>
          <div><strong>Item successfully added to bag</strong></div>
          <button
            onClick={() => navigate('/cart')}
            style={{
              marginTop: '0.5rem',
              padding: '0.3rem 0.6rem',
              backgroundColor: '#2e7d32',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            VIEW BAG
          </button>
        </div>
      </div>,
      { autoClose: 5000 }
    );
  };

  // Remove old wishlist logic - now using global context

  // Map category to icon component
  const categoryIcons = {
    'Fruits': GiFruitBowl,
    'Vegetables': GiCarrot,
    'Flowers': GiFlowerPot,
    'Grains': GiFruitBowl,
    'Milk Products': FaLeaf,
    'Honey': GiHoneyJar,
    'Others': FaLeaf
  };

  const categories = defaultCategories.length > 0 ? defaultCategories : categoryOrder.filter(cat => productsByCategory[cat]);

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (allProducts.length === 0) {
    return <div className="no-products">No products available at the moment.</div>;
  }

  // Filter products based on all filters
  const filteredProducts = allProducts.filter(product => {
    // Category filter - if selectedCategory is null, show all categories
    if (selectedCategory && product.category !== selectedCategory) {
      return false;
    }
    // Search term filter
    if (!product.name.toLowerCase().includes(localSearchTerm.toLowerCase())) {
      return false;
    }
    // Price range filter
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    // Farm location filter
    if (selectedFarmLocations.length > 0 && !selectedFarmLocations.includes(product.farmLocation)) {
      return false;
    }
    // Organic only filter
    if (organicOnly && !product.isOrganic) {
      return false;
    }
    return true;
  });

  // Group filtered products by category for display
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const category = product.category || 'Others';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  // Sort categories by order
  const sortedCategories = categoryOrder.filter(cat => groupedProducts[cat]);

  // For each category, slice products for current page
  const paginatedProductsByCategory = {};
  sortedCategories.forEach(category => {
    const currentCatPage = currentPage[category] || 1;
    const productsPerPage = getProductsPerPage(category);
    const indexOfLastProduct = currentCatPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    paginatedProductsByCategory[category] = (groupedProducts[category] || []).slice(indexOfFirstProduct, indexOfLastProduct);
  });

  // Calculate total pages for current category
  const totalPagesByCategory = {};
  sortedCategories.forEach(category => {
    const productsPerPage = getProductsPerPage(category);
    totalPagesByCategory[category] = Math.ceil((groupedProducts[category] || []).length / productsPerPage);
  });

  // Get min and max price from allProducts for slider range
  const prices = allProducts.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Unique farm locations for filter options
  const farmLocations = [...new Set(allProducts.map(p => p.farmLocation))];

  // Handlers for filter changes
  const handlePriceChange = (event) => {
    const value = Number(event.target.value);
    setPriceRange([minPrice, value]);
    setCurrentPage({}); // Reset page on filter change
  };

  const handleFarmLocationChange = (event) => {
    const value = event.target.value;
    if (event.target.checked) {
      setSelectedFarmLocations([...selectedFarmLocations, value]);
    } else {
      setSelectedFarmLocations(selectedFarmLocations.filter(loc => loc !== value));
    }
    setCurrentPage({}); // Reset page on filter change
  };

  const handleOrganicOnlyChange = (event) => {
    setOrganicOnly(event.target.checked);
    setCurrentPage({}); // Reset page on filter change
  };

  const handlePageChange = (category, pageNumber) => {
    setCurrentPage(prev => ({
      ...prev,
      [category]: pageNumber
    }));
  };

  return (
    <>
      <Navbar
        wishlistItems={wishlistItems}
        propCartItems={cartItems}
        propUserProfile={null}
        searchTerm={searchTerm}
        onSearchChange={() => {}}
      />
      <div className="products-page">
        <div style={{ display: 'flex' }}>
          <aside className="filter-sidebar" style={{ width: '250px', padding: '1rem', paddingTop: '10px', paddingBottom: '10px', borderRight: '1px solid #ccc', overflowY: 'auto' }}>
          <h3 style={{ marginBottom: '1rem' }}>Filters</h3>
          <div className="filter-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Search</label>
            <input
              type="text"
              placeholder="Search products..."
              value={localSearchTerm}
              onChange={(e) => {
                setLocalSearchTerm(e.target.value);
                setCurrentPage({});
              }}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div className="filter-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
            <div className="category-filter-vertical">
              {categories.map(category => {
                const Icon = categoryIcons[category];
                return (
                  <button
                    key={category}
                    className={`category-button-vertical ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentPage({});
                    }}
                  >
                    <span className="icon-wrapper">{Icon && <Icon size={24} />}</span>
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="filter-group" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Price Range: Up to ${priceRange[1]}</label>
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={priceRange[1]}
              onChange={handlePriceChange}
              step="0.01"
              style={{ width: '100%' }}
            />
          </div>
          <div className="filter-group" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Farm Location</label>
            <div>
              {farmLocations.map(location => (
                <div key={location} style={{ marginBottom: '0.3rem' }}>
                  <input
                    type="checkbox"
                    id={`farm-${location}`}
                    value={location}
                    checked={selectedFarmLocations.includes(location)}
                    onChange={handleFarmLocationChange}
                    style={{ verticalAlign: 'middle', marginRight: '0.3rem' }}
                  />
                  <label htmlFor={`farm-${location}`} style={{ verticalAlign: 'middle' }}>{location}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="filter-group" style={{ marginTop: '1rem' }}>
            <input
              type="checkbox"
              id="organicOnly"
              checked={organicOnly}
              onChange={handleOrganicOnlyChange}
              style={{ verticalAlign: 'middle', marginRight: '0.3rem' }}
            />
            <label htmlFor="organicOnly" style={{ verticalAlign: 'middle' }}>Organic Only</label>
          </div>
        </aside>
        <main style={{ flex: 1, padding: '1rem' }}>
          {sortedCategories.map(category => (
            <section key={category} className="products-section">
              <h2>{category}</h2>
              <div className={`products-grid ${category.replace(/\s+/g, '-').toLowerCase()}-grid`}>
                {(paginatedProductsByCategory[category] || []).map(product => (
                  <div
                    key={product.id}
                    className="product-card"
                    onClick={() => navigate(`/product/${product.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="product-image">
                      <img src={product.image} alt={product.name} />
                      <button
                        className={`btn-wishlist ${isInWishlist(product.id) ? 'in-wishlist' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                        aria-label={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      >
                        <Heart
                          size={24}
                          fill={isInWishlist(product.id) ? "#ef4444" : "none"}
                          stroke={isInWishlist(product.id) ? "#ef4444" : "black"}
                          className="wishlist-icon"
                        />
                      </button>
                      <div className="product-badges">
                        {product.isOrganic && <span className="badge organic"><FaLeaf /> Organic</span>}
                        {product.isNew && <span className="badge new">New</span>}
                      </div>
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="farmer-name">by {product.farmerName}</p>
                      <div className="rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < product.rating ? 'filled' : ''} />
                        ))}
                        <span>({product.reviewCount})</span>
                      </div>
                      <div className="price">${product.price} {product.unit}</div>
                      <button
                        className="btn-add-to-cart"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                      >
                        <FaShoppingCart /> Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {totalPagesByCategory[category] > 1 && (
                <div className="pagination">
                  <button
                    className="page-button"
                    style={{ fontSize: '12px' }}
                    onClick={() => handlePageChange(category, Math.max(1, (currentPage[category] || 1) - 1))}
                    disabled={(currentPage[category] || 1) === 1}
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPagesByCategory[category] }, (_, i) => i + 1).map(pageNumber => (
                    <button
                      key={pageNumber}
                      className={`page-button ${currentPage[category] === pageNumber ? 'active' : ''}`}
                      style={{ fontSize: '12px' }}
                      onClick={() => handlePageChange(category, pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    className="page-button"
                    style={{ fontSize: '12px' }}
                    onClick={() => handlePageChange(category, Math.min(totalPagesByCategory[category], (currentPage[category] || 1) + 1))}
                    disabled={(currentPage[category] || 1) === totalPagesByCategory[category]}
                  >
                    Next
                  </button>
                </div>
              )}
            </section>
          ))}
        </main>
        </div>
      </div>
      <ToastContainer />

      {/* Footer */}
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
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Farm2Home. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default ProductsPage;
