import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaLeaf, FaMapMarkerAlt, FaQrcode, FaComments, FaTruck, FaUser, FaInfoCircle } from 'react-icons/fa';
import { Heart } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import './ProductDetailsPage.css';
import './ConsumerDashboard.css'; // Import shared styles
import { dummyProducts } from '../data/dummyProducts';
import { consumerAPI, getImageUrl } from '../services/api';

const ProductDetailsPage = ({ cartItems, setCartItems }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('delivery');
  const [wishlistItems, setWishlistItems] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        console.log('Fetching product with ID:', id);
        const productData = await consumerAPI.getProductById(id);
        console.log('Product data received:', productData);

        if (productData) {
          const productWithDefaults = {
            ...productData,
            id: productData._id || productData.id,
            name: productData.name,
            price: productData.price,
            image: getImageUrl(productData.image_url || productData.image),
            farmerName: productData.farmer_id?.name || 'Unknown Farmer',
            farmLocation: productData.farmer_id?.location || productData.farmer_id?.farm_name || 'Location not specified',
            category: productData.category,
            unit: productData.unit || 'kg',
            description: productData.description || 'Detailed product description not available.',
            farmerBio: 'Experienced farmer committed to sustainable agriculture.',
            deliveryInfo: 'Standard delivery options apply.',
            reviews: [],
            rating: 4.5,
            reviewCount: 0,
            isOrganic: productData.category?.toLowerCase().includes('organic'),
            isNew: false
          };
          setProduct(productWithDefaults);

          // Get related products from API
          try {
            const allProducts = await consumerAPI.getProducts();
            const related = allProducts.filter(p =>
              p.category === productWithDefaults.category && (p._id || p.id) !== id
            ).slice(0, 4);
            setRelatedProducts(related.map(p => ({
              ...p,
              id: p._id || p.id,
              image: getImageUrl(p.image_url || p.image),
              farmerName: p.farmer_id?.name || 'Unknown Farmer'
            })));
          } catch (relatedError) {
            console.error('Error fetching related products:', relatedError);
            setRelatedProducts([]);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        // Fallback to dummy data if API fails
        const foundProduct = dummyProducts.find(p => p.id === parseInt(id));
        if (foundProduct) {
          const productWithDefaults = {
            ...foundProduct,
            description: foundProduct.description || 'Detailed product description not available.',
            farmerBio: foundProduct.farmerBio || 'Farmer information not available.',
            deliveryInfo: foundProduct.deliveryInfo || 'Standard delivery options apply.',
            reviews: foundProduct.reviews || [],
            farmLocation: foundProduct.farmLocation || foundProduct.location || 'Location not specified'
          };
          setProduct(productWithDefaults);
          const related = dummyProducts.filter(p =>
            p.category === productWithDefaults.category && p.id !== parseInt(id)
          ).slice(0, 4);
          setRelatedProducts(related);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    // For frontend-only, use local storage or dummy wishlist
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlistItems(JSON.parse(savedWishlist));
    }
  }, []);

  const addToCart = () => {
    if (!product) return;

    // For frontend-only, simulate add to cart without API
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      const updatedCart = cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
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
        quantity 
      }]);
    }
    toast.success(`${product.name} (${quantity}) added to cart!`);
  };

  const toggleWishlist = () => {
    if (!product) return;

    // For frontend-only, simulate toggle wishlist
    const existingIndex = wishlistItems.findIndex(item => item.productId === product.id);
    let updatedWishlist;
    if (existingIndex !== -1) {
      // Remove from wishlist
      updatedWishlist = wishlistItems.filter(item => item.productId !== product.id);
      toast.success(`${product.name} removed from wishlist!`);
    } else {
      // Add to wishlist
      updatedWishlist = [...wishlistItems, { productId: product.id }];
      toast.success(`${product.name} added to wishlist!`);
    }
    setWishlistItems(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const handleChatWithFarmer = () => {
    // Placeholder for chat functionality
    toast.info('Chat with farmer feature coming soon!');
  };

  if (loading) {
    return (
      <>
        <Navbar cartItems={cartItems} />
        <div className="loading">Loading product details...</div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar cartItems={cartItems} />
        <div className="product-not-found">
          <h2>Product not found</h2>
          <button onClick={() => navigate('/products')} className="btn-primary-large">
            Back to Products
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar cartItems={cartItems} />
      <div className="product-details-page">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>{' > '}
            <Link to={`/products?category=${product.category}`}>
              {product.category}
            </Link>{' > '}
            {product.name}
          </nav>
          {/* Main Product Section */}
          <div className="product-main">
            <div className="product-image-section">
              <img src={product.image} alt={product.name} className="product-main-image" />
              <div className="product-badges">
                {product.isOrganic && <span className="badge organic"><FaLeaf /> Organic</span>}
                {product.isNew && <span className="badge new">New</span>}
              </div>
            </div>

            <div className="product-info-section">
              <h1 className="product-title">{product.name}</h1>
              <p className="product-farmer">By {product.farmerName} from {product.farmLocation}</p>

              <div className="product-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < product.rating ? 'star filled' : 'star'} />
                  ))}
                </div>
                <span className="rating-text">({product.reviewCount} reviews)</span>
              </div>

              <div className="product-price">
                <span className="price">${product.price}</span>
                <span className="unit">/ {product.unit}</span>
              </div>

              <p className="product-description">{product.description}</p>

              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="product-actions">
                <button className="btn-add-to-cart" onClick={addToCart}>
                  <FaShoppingCart /> Add to Cart - ${(product.price * quantity).toFixed(2)}
                </button>
                <button
                  className={`btn-wishlist ${isInWishlist(product.id) ? 'in-wishlist' : ''}`}
                  onClick={toggleWishlist}
                  aria-label={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart
                    size={24}
                    fill={isInWishlist(product.id) ? "#ef4444" : "none"}
                    stroke={isInWishlist(product.id) ? "#ef4444" : "black"}
                    className="wishlist-icon"
                  />
                  {isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
              </div>

              {/* Optional Features */}
              <div className="optional-features">
                <button className="feature-btn" onClick={handleChatWithFarmer}>
                  <FaComments /> Chat with Farmer
                </button>
                <div className="feature-btn qr-code">
                  <FaQrcode /> Farm Origin QR Code
                  <div className="qr-placeholder">QR Code</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="product-tabs">
            <div className="tab-buttons">
              <button
                className={`tab-btn ${activeTab === 'delivery' ? 'active' : ''}`}
                onClick={() => setActiveTab('delivery')}
              >
                <FaTruck /> Delivery Info
              </button>
              <button
                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                <FaStar /> Reviews ({product.reviews?.length || 0})
              </button>
              <button
                className={`tab-btn ${activeTab === 'farmer' ? 'active' : ''}`}
                onClick={() => setActiveTab('farmer')}
              >
                <FaUser /> About the Farmer
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'delivery' && (
                <div className="delivery-info">
                  <h3>Delivery Information</h3>
                  <p>{product.deliveryInfo}</p>
                  <div className="delivery-options">
                    <div className="option">
                      <FaTruck /> Standard Delivery: 2-3 business days
                    </div>
                    <div className="option">
                      <FaTruck /> Express Delivery: 1 business day (+$5)
                    </div>
                    <div className="option">
                      <FaLeaf /> Carbon-neutral shipping available
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="reviews-section">
                  <h3>Customer Reviews</h3>
                  {product.reviews?.map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <strong>{review.user}</strong>
                        <div className="review-stars">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < review.rating ? 'star filled' : 'star'} />
                          ))}
                        </div>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'farmer' && (
                <div className="farmer-info">
                  <h3>About {product.farmerName}</h3>
                  <p>{product.farmerBio}</p>
                  <div className="farmer-location">
                    <FaMapMarkerAlt /> Location: {product.farmLocation}
                    <div className="map-placeholder">
                      {/* Placeholder for map - in real app, integrate Google Maps */}
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.8354345093747!2d-122.41941548468116!3d37.77492977975917!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085808c3b1c2c7%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1623456789012!5m2!1sen!2sus"
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        title="Farmer Location"
                      ></iframe>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="related-products">
              <h2>Related Products</h2>
              <div className="products-grid">
                {relatedProducts.map(relatedProduct => (
                  <div
                    key={relatedProduct.id}
                    className="product-card"
                    onClick={() => navigate(`/product/${relatedProduct.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="product-image">
                      <img src={relatedProduct.image} alt={relatedProduct.name} />
                      <div className="product-badges">
                        {relatedProduct.isOrganic && <span className="badge organic"><FaLeaf /> Organic</span>}
                        {relatedProduct.isNew && <span className="badge new">New</span>}
                      </div>
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{relatedProduct.name}</h3>
                      <p className="product-farmer">By {relatedProduct.farmerName}</p>
                      <div className="product-rating">
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < relatedProduct.rating ? 'star filled' : 'star'} />
                          ))}
                        </div>
                        <span className="rating-text">({relatedProduct.reviewCount})</span>
                      </div>
                      <div className="product-price">
                        <span className="price">${relatedProduct.price}</span>
                        <span className="unit">/ {relatedProduct.unit}</span>
                      </div>
                      <button
                        className="btn-add-to-cart"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Quick add to cart for related products
                          const existingItem = cartItems.find(item => item.id === relatedProduct.id);
                          if (existingItem) {
                            const updatedCart = cartItems.map(item =>
                              item.id === relatedProduct.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                            );
                            setCartItems(updatedCart);
                          } else {
                            setCartItems([...cartItems, { 
                              id: relatedProduct.id, 
                              name: relatedProduct.name, 
                              price: relatedProduct.price, 
                              farmer: relatedProduct.farmerName,
                              unit: relatedProduct.unit,
                              quantity: 1 
                            }]);
                          }
                          toast.success(`${relatedProduct.name} added to cart!`);
                        }}
                      >
                        <FaShoppingCart /> Quick Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetailsPage;
