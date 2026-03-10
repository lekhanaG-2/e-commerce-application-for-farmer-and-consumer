import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getImageUrl } from '../services/api';
import './SpecialOrderList.css';

const SpecialOrderList = ({ searchTerm, onSearchChange, userProfile, wishlistItems, onLogout }) => {
  const [farmersData, setFarmersData] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [products, setProducts] = useState([]);
  const [specialOffers, setSpecialOffers] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPreBookModal, setShowPreBookModal] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [preBookQuantity, setPreBookQuantity] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const navigate = useNavigate();

  const dummySeasonalCrops = [
    {
      id: 1,
      name: 'Mangoes',
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c1193e3?w=300&h=300&fit=crop',
      expectedHarvest: '15-Mar-2026',
      preOrderPrice: 60,
      unit: 'kg'
    },
    {
      id: 2,
      name: 'Lychees',
      imageUrl: 'https://images.unsplash.com/photo-1580052614034-382b8d7e7e99?w=300&h=300&fit=crop',
      expectedHarvest: '20-Jun-2026',
      preOrderPrice: 150,
      unit: 'kg'
    }
  ];

  const handleFarmerChange = (e) => {
    const farmerId = e.target.value;
    if (!farmerId) {
      setSelectedFarmer(null);
      setProducts([]);
      setOrderItems([]);
      setTotalCost(0);
      return;
    }
    const farmer = farmersData.find(f => f.id === farmerId);
    setSelectedFarmer(farmer);
    setProducts(farmer ? farmer.products : []);
    setOrderItems([]);
    setTotalCost(0);
  };

  useEffect(() => {
    // Fetch special offers from API
    const fetchSpecialOffers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/special-orders/special-orders/offers');
        if (response.ok) {
          const offers = await response.json();
          setSpecialOffers(offers);
        }
      } catch (error) {
        console.error('Error fetching special offers:', error);
      }
    };

    // Fetch bulk products with farmer details from API
    const fetchBulkProducts = async () => {
      try {
        console.log('Fetching bulk products from API...');
        const response = await fetch('http://localhost:5000/api/special-orders/bulk-products');
        console.log('API response status:', response.status);
        if (response.ok) {
          const farmersWithProducts = await response.json();
          console.log('Received farmers data:', farmersWithProducts.length, 'farmers');

          // Filter to only include bulk products (product_type: 'bulk')
          const filteredFarmers = farmersWithProducts.map(farmer => ({
            ...farmer,
            products: farmer.products.filter(product => product.product_type === 'bulk')
          })).filter(farmer => farmer.products.length > 0);

          console.log('Filtered farmers with bulk products:', filteredFarmers.length, 'farmers');
          setFarmersData(filteredFarmers);

          // Set first farmer as selected by default if available
          if (filteredFarmers.length > 0) {
            console.log('Setting first farmer:', filteredFarmers[0].name);
            setSelectedFarmer(filteredFarmers[0]);
            setProducts(filteredFarmers[0].products || []);
          } else {
            console.log('No farmers with bulk products found');
            setSelectedFarmer(null);
            setProducts([]);
          }
        } else {
          console.error('API response not ok:', response.status);
          setFarmersData([]);
          setSelectedFarmer(null);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching bulk products:', error);
        setFarmersData([]);
        setSelectedFarmer(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialOffers();
    fetchBulkProducts();
  }, []);

  const handleQuantityChange = (productId, quantity) => {
    const product = products.find(p => p.id === productId);
    if (quantity > product.available_qty) {
      alert(`Maximum available: ${product.available_qty} ${product.unit}`);
      return;
    }
    const minOrder = product.minimumOrder || 1;
    if (quantity < minOrder && quantity !== 0) {
      alert(`Minimum order quantity: ${minOrder} ${product.unit}`);
      return;
    }
    if (quantity < minOrder) {
      // Remove from order
      setOrderItems(prev => prev.filter(item => item.id !== productId));
    } else {
      // Add or update in order
      setOrderItems(prev => {
        const existing = prev.find(item => item.id === productId);
        if (existing) {
          return prev.map(item => item.id === productId ? { ...item, quantity } : item);
        }
        return [...prev, { ...product, quantity }];
      });
    }
    updateTotalCost();
  };

  const updateTotalCost = () => {
    const total = orderItems.reduce((sum, item) => sum + (item.price_per_unit * item.quantity), 0);
    setTotalCost(total);
  };

  const handlePlaceOrder = () => {
    if (orderItems.length === 0) {
      alert('Please add items to order');
      return;
    }
    // Simulate submission
    alert(`Bulk order placed for ${orderItems.length} items. Total: ₹${totalCost}`);
    setOrderItems([]);
    setTotalCost(0);
  };

  const handlePreBook = (crop) => {
    setSelectedCrop(crop);
    setPreBookQuantity(1);
    setDeliveryDate('');
    setPaymentMethod('upi');
    setShowPreBookModal(true);
  };

  const handleNotifyMe = (crop) => {
    alert(`Notification set for ${crop.name}`);
  };

  const handlePreBookSubmit = () => {
    if (preBookQuantity < 1) {
      alert('Quantity must be at least 1');
      return;
    }
    if (!deliveryDate) {
      alert('Please select a delivery date');
      return;
    }
    const total = selectedCrop.preOrderPrice * preBookQuantity;
    alert(`Pre-booked ${selectedCrop.name} x ${preBookQuantity} at ₹${total}. Delivery: ${deliveryDate}. Payment: ${paymentMethod.toUpperCase()}. Harvest: ${selectedCrop.expectedHarvest}`);
    setShowPreBookModal(false);
    setSelectedCrop(null);
  };

  const closePreBookModal = () => {
    setShowPreBookModal(false);
    setSelectedCrop(null);
  };

  return (
    <>
      <Navbar
        wishlistItems={wishlistItems}
        propCartItems={[]}
        propUserProfile={userProfile}
        onLogout={onLogout}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />
      <div className="special-order-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <h1>🌾 Special Orders & Pre-Bookings</h1>
            <p>Bulk orders and upcoming seasonal crops, directly from our trusted farmers.</p>
          </div>
        </section>

        {/* Farmer Details Card */}
        {farmersData.length > 0 && (
          <section className="farmer-section">
            <div className="container">
              <div className="farmer-card">
                <div className="farmer-details">
                  <h2>👨‍🌾 {selectedFarmer?.name || 'Select a Farmer'}</h2>
                  <p className="location">📍 {selectedFarmer?.location || 'Choose a farmer to see their products'}</p>
                  <p className="bio">Trusted farmer with fresh produce</p>
                  <label htmlFor="farmer-select">Change Farmer: </label>
                  <select id="farmer-select" value={selectedFarmer?.id || ''} onChange={handleFarmerChange}>
                    <option value="">Select a Farmer</option>
                    {farmersData.map(farmer => (
                      <option key={farmer.id} value={farmer.id}>{farmer.name} - {farmer.location}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ padding: '10px', background: '#f0f0f0', fontSize: '12px' }}>
            Debug: {farmersData.length} farmers, {products.length} products, Selected: {selectedFarmer?.name || 'None'}
          </div>
        )}

        <div className="container">
          {/* Bulk Orders Section */}
          <section className="bulk-orders-section">
            <h2>Bulk Orders</h2>
            <div className="bulk-content">
              <div className="product-grid">
                {products.map(product => (
                  <div key={product.id} className="product-card">
                    <img src={product.imageUrl ? `http://localhost:5000${product.imageUrl}` : 'https://via.placeholder.com/400x300/cccccc/666666?text=No+Image'} alt={product.productName} />
                    <h3>{product.productName}</h3>
                    <p>₹{product.price_per_unit} per {product.unit}</p>
                    <p>Available: {product.available_qty} {product.unit}</p>
                    {product.minimumOrder > 1 && <p>Min Order: {product.minimumOrder} {product.unit}</p>}
                    <p>By: {product.farmerName}</p>
                    <input
                      type="number"
                      min={product.minimumOrder || 1}
                      max={product.available_qty}
                      placeholder="Qty"
                      onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 0)}
                    />
                    <button onClick={() => handleQuantityChange(product.id, product.minimumOrder || 1)}>Add</button>
                  </div>
                ))}
              </div>
              <div className="order-summary">
                <h3>🧾 Order Summary</h3>
                {orderItems.map(item => (
                  <div key={item.id} className="summary-item">
                    <span>{item.productName} x {item.quantity}</span>
                    <span>₹{item.price_per_unit * item.quantity}</span>
                  </div>
                ))}
                <div className="total">Total: ₹{totalCost}</div>
                <button className="place-order-btn" onClick={handlePlaceOrder}>Place Bulk Order</button>
              </div>
            </div>
          </section>

          {/* Special Offers Section */}
          {specialOffers.length > 0 && (
            <section className="special-offers-section">
              <h2>🌟 Special Offers</h2>
              <div className="offers-grid">
                {specialOffers.map(offer => (
                  <div key={offer._id} className="offer-card">
                    {offer.image && (
                      <img src={getImageUrl(offer.image)} alt={offer.product_name} />
                    )}
                    <h3>{offer.product_name}</h3>
                    <p>{offer.description}</p>
                    <p>Price: ₹{offer.price_per_unit} per {offer.unit}</p>
                    <p>Available: {offer.quantity} {offer.unit}</p>
                    <p>From: {new Date(offer.available_from).toLocaleDateString()} - To: {new Date(offer.available_until).toLocaleDateString()}</p>
                    <button onClick={() => handlePreBook(offer)}>Special Order</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Seasonal Crop Pre-Order Section */}
          <section className="pre-order-section">
            <h2>📅 Upcoming Seasonal Crops</h2>
            <div className="crops-grid">
              {dummySeasonalCrops.map(crop => (
                <div key={crop.id} className="crop-card">
                  <img src={crop.imageUrl} alt={crop.name} />
                  <h3>{crop.name}</h3>
                  <p>Expected Harvest: {crop.expectedHarvest}</p>
                  <p>Pre-order Price: ₹{crop.preOrderPrice}/{crop.unit}</p>
                  <button onClick={() => handlePreBook(crop)}>Pre-Book Now</button>
                  <button onClick={() => handleNotifyMe(crop)}>Notify Me</button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <p>&copy; 2024 Farm2Home. All rights reserved. | Contact: support@farm2home.com</p>
          </div>
        </footer>

        {/* Pre-Book Modal */}
        {showPreBookModal && selectedCrop && (
          <div className="modal">
            <div className="modal-content">
              <h3>Pre-Book {selectedCrop.name}</h3>
              <label>Quantity (kg):</label>
              <input
                type="number"
                min="1"
                value={preBookQuantity}
                onChange={(e) => setPreBookQuantity(parseInt(e.target.value) || 1)}
              />
              <label>Delivery Date:</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
              <label>Payment Method:</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="netbanking">Net Banking</option>
              </select>
              <button onClick={handlePreBookSubmit}>Confirm Pre-Booking</button>
              <button onClick={closePreBookModal}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SpecialOrderList;
