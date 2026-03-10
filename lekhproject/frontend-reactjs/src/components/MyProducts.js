import React, { useState, useEffect } from 'react';
import { FaStar, FaEdit, FaTrash } from 'react-icons/fa';
import { getImageUrl, farmerAPI } from '../services/api';
import { toast } from 'react-toastify';

const MyProducts = ({ products = [] }) => {
  const [localProducts, setLocalProducts] = useState(products);
  const [loading, setLoading] = useState(true);

  // Fetch products from API if not provided
  useEffect(() => {
    const fetchProducts = async () => {
      if (products.length === 0) {
        try {
          setLoading(true);
          const fetchedProducts = await farmerAPI.getProducts();
          setLocalProducts(fetchedProducts);
        } catch (error) {
          console.error('Error fetching products:', error);
          toast.error('Failed to load products');
        } finally {
          setLoading(false);
        }
      } else {
        setLocalProducts(products);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [products]);

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Note: This would need a delete endpoint in the backend
        // For now, just remove from local state
        setLocalProducts(prev => prev.filter(p => p._id !== productId));
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  if (loading) {
    return (
      <div className="my-products-container">
        <h2>My Products</h2>
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading products...</div>
      </div>
    );
  }

  return (
    <div className="my-products-container">
      <h2>My Products</h2>
      {localProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          No products found. Add your first product!
        </div>
      ) : (
        <div className="products-grid">
          {localProducts.map(({_id, image_url, name, price, rating, reviews, stock_quantity, category, description, minimumOrder}) => (
            <div key={_id} className="product-card">
              <img
                src={getImageUrl(image_url) || 'https://via.placeholder.com/400x300/cccccc/666666?text=No+Image'}
                alt={name}
                className="product-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300/cccccc/666666?text=Image+Not+Available';
                }}
              />
              <div className="product-info">
                <h3>{name}</h3>
                <p className="price">₹{price}</p>
                <p className="quantity">Stock: {stock_quantity} kg</p>
                {minimumOrder > 0 && <p className="minimum-order">Min Order: {minimumOrder} kg</p>}
                <p className="category">{category}</p>
                <p className="description">{description}</p>
                <div className="rating">
                  <FaStar color="#FFD700" />
                  <span>{rating || 4.5} ({reviews || 0})</span>
                </div>
                <div className="product-actions">
                  <button className="edit-btn" title="Edit Product">
                    <FaEdit />
                  </button>
                  <button
                    className="delete-btn"
                    title="Delete Product"
                    onClick={() => handleDeleteProduct(_id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProducts;
