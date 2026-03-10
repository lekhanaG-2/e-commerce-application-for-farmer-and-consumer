import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaMapMarkerAlt, FaSearch, FaFilter, FaSort, FaStar, FaShoppingCart, FaUser } from 'react-icons/fa';
import { dummyFarmers, dummyFarmerProducts } from '../data/dummyFarmers';

const FarmersPage = ({ searchTerm, onSearchChange, userProfile, wishlistItems, onLogout, cartItems, setCartItems }) => {
  const [farmers] = useState(dummyFarmers);
  const [filteredFarmers, setFilteredFarmers] = useState(farmers);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4); // All data fits, but for pagination structure

  // Filter states
  const [locationFilter, setLocationFilter] = useState('');
  const [cropFilters, setCropFilters] = useState([]);
  const [verifiedFilter, setVerifiedFilter] = useState(false);
  const [seasonalFilter, setSeasonalFilter] = useState('');
  const [minOrderFilter, setMinOrderFilter] = useState(0);
  const [deliveryRadiusFilter, setDeliveryRadiusFilter] = useState(50);
  const [priceRangeFilter, setPriceRangeFilter] = useState([0, 200]);

  // Extract unique locations and crops
  const uniqueLocations = [...new Set(farmers.map(f => f.location))];
  const allCrops = [...new Set(Object.values(dummyFarmerProducts).flatMap(products => products.map(p => p.productName)))];
  const [availableCrops] = useState(allCrops);

  useEffect(() => {
    let result = farmers.filter(farmer => {
      // Search filter
      const matchesSearch = farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            farmer.location.toLowerCase().includes(searchTerm.toLowerCase());

      // Location filter
      const matchesLocation = !locationFilter || farmer.location.includes(locationFilter);

      // Crop filter
      const farmerCrops = dummyFarmerProducts[farmer.id] ? dummyFarmerProducts[farmer.id].map(p => p.productName) : [];
      const matchesCrops = cropFilters.length === 0 || cropFilters.every(crop => farmerCrops.includes(crop));

      // Verified (mock all as verified for now)
      const matchesVerified = !verifiedFilter || true; // Assume all verified

      // Seasonal (mock)
      const matchesSeasonal = !seasonalFilter || true;

      // Min order (mock)
      const matchesMinOrder = true;

      // Delivery radius (mock)
      const matchesDelivery = true;

      // Price range (mock average product price)
      const avgPrice = dummyFarmerProducts[farmer.id] ? dummyFarmerProducts[farmer.id].reduce((sum, p) => sum + p.price_per_unit, 0) / dummyFarmerProducts[farmer.id].length : 0;
      const matchesPrice = avgPrice >= priceRangeFilter[0] && avgPrice <= priceRangeFilter[1];

      return matchesSearch && matchesLocation && matchesCrops && matchesVerified && matchesSeasonal && matchesMinOrder && matchesDelivery && matchesPrice;
    });

    // Sort
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'location') {
      result.sort((a, b) => a.location.localeCompare(b.location));
    } else if (sortBy === 'nearest') {
      // Mock nearest by location string
      result.sort((a, b) => a.location.localeCompare(b.location));
    }

    setFilteredFarmers(result);
    setCurrentPage(1);
  }, [searchTerm, locationFilter, cropFilters, verifiedFilter, seasonalFilter, minOrderFilter, deliveryRadiusFilter, priceRangeFilter, sortBy, farmers]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentFarmers = filteredFarmers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredFarmers.length / itemsPerPage);

  const handleCropChange = (crop) => {
    setCropFilters(prev => 
      prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]
    );
  };

  const resetFilters = () => {
    setLocationFilter('');
    setCropFilters([]);
    setVerifiedFilter(false);
    setSeasonalFilter('');
    setMinOrderFilter(0);
    setDeliveryRadiusFilter(50);
    setPriceRangeFilter([0, 200]);
  };

  return (
    <>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        height: '50vh',
        backgroundImage: `url('/hero-image.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        color: 'white',
        textAlign: 'left'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(46, 125, 50, 0.6)',
          zIndex: 1
        }} />
        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '2rem',
          maxWidth: '60%',
          marginLeft: '2rem'
        }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '700' }}>
            🧑‍🌾 Farmers
          </h1>
          <p style={{ fontSize: '1.3rem', lineHeight: '1.6' }}>
            Meet local farmers near you — view their profiles, crops, and buy directly from the source.
          </p>
        </div>
      </section>

      {/* Top Controls */}
      <section style={{ padding: '1rem 2rem', backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <FaSearch style={{ color: '#2e7d32' }} />
          <input
            type="text"
            placeholder="Search farmer or crop name"
            value={searchTerm}
            onChange={onSearchChange}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              width: '300px'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setShowFilters(!showFilters)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#4caf50', color: 'white', border: 'none', borderRadius: '8px' }}>
            <FaFilter /> Filter
          </button>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '0.5rem 1rem', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <option value="name">Sort: Name</option>
            <option value="location">Sort: Location</option>
            <option value="nearest">Sort: Nearest</option>
          </select>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ padding: '2rem', display: 'flex', gap: '2rem', maxWidth: '1400px', margin: '0 auto', flexWrap: 'wrap' }}>
        {/* Left Sidebar - Filters */}
        {showFilters && (
          <div style={{ width: '250px', minWidth: '250px', background: 'white', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>Filters</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label>Location:</label>
              <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}>
                <option value="">All Locations</option>
                {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Crop Type:</label>
              {availableCrops.map(crop => (
                <label key={crop} style={{ display: 'block', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={cropFilters.includes(crop)}
                    onChange={() => handleCropChange(crop)}
                  /> {crop}
                </label>
              ))}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>
                <input
                  type="checkbox"
                  checked={verifiedFilter}
                  onChange={(e) => setVerifiedFilter(e.target.checked)}
                /> Verified Only
              </label>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Seasonal:</label>
              <select value={seasonalFilter} onChange={(e) => setSeasonalFilter(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}>
                <option value="">All Seasons</option>
                <option value="summer">Summer</option>
                <option value="winter">Winter</option>
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Min Order: {minOrderFilter}</label>
              <input
                type="range"
                min="0"
                max="100"
                value={minOrderFilter}
                onChange={(e) => setMinOrderFilter(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Delivery Radius: {deliveryRadiusFilter}km</label>
              <input
                type="range"
                min="10"
                max="100"
                value={deliveryRadiusFilter}
                onChange={(e) => setDeliveryRadiusFilter(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Price Range: ₹{priceRangeFilter[0]} - ₹{priceRangeFilter[1]}</label>
              <input
                type="range"
                min="0"
                max="200"
                value={priceRangeFilter[1]}
                onChange={(e) => setPriceRangeFilter([priceRangeFilter[0], Number(e.target.value)])}
                style={{ width: '100%' }}
              />
            </div>
            <button onClick={resetFilters} style={{ width: '100%', padding: '0.5rem', background: '#ff9800', color: 'white', border: 'none', borderRadius: '8px' }}>
              Reset Filters
            </button>
          </div>
        )}

        {/* Center Grid */}
        <div style={{ flex: 1, minWidth: '300px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {currentFarmers.length === 0 ? (
            <p>No farmers found. Try adjusting your filters.</p>
          ) : (
            currentFarmers.map(farmer => {
              const farmerProducts = dummyFarmerProducts[farmer.id] || [];
              const crops = farmerProducts.map(p => p.productName).join(', ');
              return (
                <div key={farmer.id} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <img
                    src={`https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200&fit=crop`} // Placeholder farmer photo
                    alt={farmer.name}
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <h3 style={{ color: '#2e7d32', margin: 0 }}>{farmer.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaMapMarkerAlt style={{ color: '#4caf50' }} />
                    <span>{farmer.location}</span>
                  </div>
                  <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.5rem 0' }}>{crops}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <FaStar style={{ color: '#ff9800' }} />
                    <span>Verified</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/special-order/${farmer.id}`} style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: '#4caf50',
                      color: 'white',
                      textAlign: 'center',
                      borderRadius: '8px',
                      textDecoration: 'none'
                    }}>
                      View Profile
                    </Link>
                    <Link to="/products" style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: '#ff9800',
                      color: 'white',
                      textAlign: 'center',
                      borderRadius: '8px',
                      textDecoration: 'none'
                    }}>
                      Shop
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Sidebar */}
        <div style={{ width: '300px', minWidth: '300px', background: 'white', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>Map</h3>
          <div style={{ height: '300px', background: '#e0e0e0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            Interactive Map Placeholder - Click pins to view farmers
          </div>
          <h3 style={{ color: '#2e7d32', margin: '1rem 0 0.5rem 0' }}>Farmer Spotlight</h3>
          {farmers[0] && (
            <div style={{ padding: '1rem', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
              <img
                src={`https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100&h=100&fit=crop`}
                alt={farmers[0].name}
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', marginBottom: '0.5rem' }}
              />
              <h4>{farmers[0].name}</h4>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>{farmers[0].profileInfo}</p>
            </div>
          )}
          <Link to="/products" style={{
            width: '100%',
            padding: '1rem',
            background: '#4caf50',
            color: 'white',
            textAlign: 'center',
            borderRadius: '8px',
            textDecoration: 'none',
            display: 'block',
            marginTop: '1rem'
          }}>
            Shop Now <FaShoppingCart style={{ marginLeft: '0.5rem' }} />
          </Link>
        </div>
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', backgroundColor: '#f8f9fa' }}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} style={{ padding: '0.5rem 1rem', border: '1px solid #e0e0e0', background: 'white', borderRadius: '8px' }}>
            {'<< Prev'}
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #e0e0e0',
                background: currentPage === page ? '#4caf50' : 'white',
                color: currentPage === page ? 'white' : '#333',
                borderRadius: '8px'
              }}
            >
              {page}
            </button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} style={{ padding: '0.5rem 1rem', border: '1px solid #e0e0e0', background: 'white', borderRadius: '8px' }}>
            {'Next >>'}
          </button>
          <select style={{ padding: '0.5rem' }}>
            <option>Show: 4 per page</option>
          </select>
        </section>
      )}
    </>
  );
};

export default FarmersPage;
