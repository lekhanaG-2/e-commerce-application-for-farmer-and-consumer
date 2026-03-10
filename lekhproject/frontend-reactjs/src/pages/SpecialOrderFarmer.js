import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BulkOrderForm from '../components/BulkOrderForm';
import './SpecialOrderFarmer.css';

const SpecialOrderFarmer = ({ searchTerm, onSearchChange, userProfile, wishlistItems, onLogout }) => {
  const { farmerId } = useParams();
  const [farmer, setFarmer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalProducts, setModalProducts] = useState([]);

  const fetchFarmerAndProducts = useCallback(async () => {
    try {
      const [farmerRes, productsRes] = await Promise.all([
        fetch('http://localhost:5000/api/farmers'),
        fetch(`http://localhost:5000/api/farmers/${farmerId}/products`)
      ]);
      const farmers = await farmerRes.json();
      const productsData = await productsRes.json();
      if (farmers && farmers.length > 0 && productsData && productsData.length > 0) {
        const currentFarmer = farmers.find(f => f.id === parseInt(farmerId));
        setFarmer(currentFarmer);
        setProducts(productsData);
      } else {
        // Fallback to dummy data
        const { dummyFarmers, dummyFarmerProducts } = await import('../data/dummyFarmers.js');
        const currentFarmer = dummyFarmers.find(f => f.id === parseInt(farmerId));
        const fallbackProducts = dummyFarmerProducts[farmerId] || [];
        setFarmer(currentFarmer);
        setProducts(fallbackProducts);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to dummy data
      const { dummyFarmers, dummyFarmerProducts } = await import('../data/dummyFarmers.js');
      const currentFarmer = dummyFarmers.find(f => f.id === parseInt(farmerId));
      const fallbackProducts = dummyFarmerProducts[farmerId] || [];
      setFarmer(currentFarmer);
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  }, [farmerId]);

  useEffect(() => {
    fetchFarmerAndProducts();
  }, [fetchFarmerAndProducts]);

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleOrderNow = (product) => {
    setModalProducts([product]);
    setShowModal(true);
  };

  const handleStartBulkOrder = () => {
    const selected = products.filter(p => selectedProducts.includes(p.id));
    setModalProducts(selected);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalProducts([]);
  };

  if (loading) {
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
        <div className="special-order-farmer-page">
          <div className="loading">Loading products...</div>
        </div>
      </>
    );
  }

  if (!farmer) {
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
        <div className="special-order-farmer-page">
          <div className="error">Farmer not found.</div>
        </div>
      </>
    );
  }

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
      <div className="special-order-farmer-page">
        <div className="container">
          <div className="farmer-header">
            <h1>🌾 Products from {farmer.name}</h1>
            <p>{farmer.location} • {farmer.profileInfo}</p>
          </div>
          {selectedProducts.length > 0 && (
            <div className="bulk-order-section">
              <button className="start-bulk-order-btn" onClick={handleStartBulkOrder}>
                Start Bulk Order ({selectedProducts.length} selected)
              </button>
            </div>
          )}
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleProductSelect(product.id)}
                  className="product-checkbox"
                />
                <img src={product.imageUrl} alt={product.productName} className="product-image" />
                <div className="product-info">
                  <h3>{product.productName}</h3>
                  <p className="price">₹{product.price_per_unit} per {product.unit}</p>
                  <p className="available">Available: {product.available_qty} {product.unit}</p>
                </div>
                <button
                  className="order-now-btn"
                  onClick={() => handleOrderNow(product)}
                  disabled={product.available_qty === 0}
                >
                  {product.available_qty === 0 ? 'Out of Stock' : 'Order Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
        {showModal && (
          <BulkOrderForm
            farmer={farmer}
            products={modalProducts}
            userProfile={userProfile}
            onClose={closeModal}
          />
        )}
      </div>
    </>
  );
};

export default SpecialOrderFarmer;
