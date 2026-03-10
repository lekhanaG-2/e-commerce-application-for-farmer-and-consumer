import React, { useState } from 'react';
import { farmerAPI } from '../services/api';
import './AddSpecialOrder.css';

const AddSpecialOrder = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    quantity: '',
    unit: 'kg',
    price_per_unit: '',
    minimum_order: '1',
    available_from: '',
    available_until: '',
    delivery_options: ['home_delivery'],
    payment_terms: 'Cash on delivery',
    notes: '',
    image: null
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Frontend validation
    if (!formData.product_name.trim()) {
      setError('Product name is required.');
      setLoading(false);
      return;
    }
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      setError('Quantity must be a positive number.');
      setLoading(false);
      return;
    }
    if (!formData.price_per_unit || parseFloat(formData.price_per_unit) <= 0) {
      setError('Price per unit must be a positive number.');
      setLoading(false);
      return;
    }
    if (!formData.available_from) {
      setError('Available from date is required.');
      setLoading(false);
      return;
    }
    if (!formData.available_until) {
      setError('Available until date is required.');
      setLoading(false);
      return;
    }
    if (new Date(formData.available_from) >= new Date(formData.available_until)) {
      setError('Available until date must be after available from date.');
      setLoading(false);
      return;
    }

    // Prepare FormData for file upload
    const submitData = new FormData();
    submitData.append('product_name', formData.product_name.trim());
    submitData.append('description', formData.description || '');
    submitData.append('quantity', formData.quantity.toString());
    submitData.append('unit', formData.unit);
    submitData.append('price_per_unit', formData.price_per_unit.toString());
    submitData.append('minimum_order', (formData.minimum_order || '1').toString());
    submitData.append('available_from', formData.available_from);
    submitData.append('available_until', formData.available_until);
    submitData.append('delivery_options', JSON.stringify(formData.delivery_options));
    submitData.append('payment_terms', formData.payment_terms);
    submitData.append('notes', formData.notes || '');

    if (formData.image) {
      submitData.append('image', formData.image);
    }

    try {
      console.log('Submitting special order form data:', submitData);
      console.log('Checking JWT token:', localStorage.getItem('token'));
      const response = await farmerAPI.addSpecialOrder(submitData);
      console.log('Special order creation response:', response);
      onSubmit(submitData);
    } catch (error) {
      console.error('Special order creation error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError(`Failed to add special order offer: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="add-special-order">
      <div className="form-header">
        <h2>Add New Special Order Offer</h2>
        <p>Create a special offer to attract customers with unique products or bulk deals.</p>
      </div>

      <form onSubmit={handleSubmit} className="special-order-form">
        <div className="form-group">
          <label htmlFor="product_name">Product Name *</label>
          <input
            type="text"
            id="product_name"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            placeholder="e.g., Organic Tomatoes"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Describe your special offer, what makes it unique..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price_per_unit">Price per Unit *</label>
            <input
              type="number"
              id="price_per_unit"
              name="price_per_unit"
              value={formData.price_per_unit}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="quantity">Available Quantity *</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              placeholder="0"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="unit">Unit *</label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              required
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="pieces">pieces</option>
              <option value="dozen">dozen</option>
              <option value="liters">liters</option>
              <option value="ml">ml</option>
              <option value="crates">crates</option>
              <option value="boxes">boxes</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="available_from">Available From *</label>
            <input
              type="date"
              id="available_from"
              name="available_from"
              value={formData.available_from}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="available_until">Available Until *</label>
            <input
              type="date"
              id="available_until"
              name="available_until"
              value={formData.available_until}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="image">Product Image</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="2"
            placeholder="Any special instructions, delivery terms, or requirements..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="minimum_order">Minimum Order Quantity</label>
          <input
            type="number"
            id="minimum_order"
            name="minimum_order"
            value={formData.minimum_order}
            onChange={handleChange}
            min="1"
            placeholder="1"
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Offer...' : 'Create Special Offer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSpecialOrder;
