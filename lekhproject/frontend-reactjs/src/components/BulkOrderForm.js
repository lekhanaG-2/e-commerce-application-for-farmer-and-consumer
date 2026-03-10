import React, { useState, useEffect } from 'react';
import './BulkOrderForm.css';

const BulkOrderForm = ({ farmer, products, userProfile, onClose }) => {
  const [formData, setFormData] = useState({
    eventType: '',
    deliveryDate: '',
    deliveryAddress: '',
    contactPhone: userProfile?.mobile || '',
    notes: '',
    quantities: {}
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Initialize quantities
    const initialQuantities = {};
    products.forEach(product => {
      initialQuantities[product.id] = 1;
    });
    setFormData(prev => ({ ...prev, quantities: initialQuantities }));
  }, [products]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (productId, qty) => {
    const quantity = parseInt(qty) || 0;
    setFormData(prev => ({
      ...prev,
      quantities: { ...prev.quantities, [productId]: quantity }
    }));
  };

  const calculateTotal = () => {
    return products.reduce((total, product) => {
      const qty = formData.quantities[product.id] || 0;
      return total + (product.price_per_unit * qty);
    }, 0);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.eventType) newErrors.eventType = 'Event type is required';
    if (!formData.deliveryDate) newErrors.deliveryDate = 'Delivery date is required';
    if (!formData.deliveryAddress) newErrors.deliveryAddress = 'Delivery address is required';
    if (!formData.contactPhone) newErrors.contactPhone = 'Contact phone is required';

    products.forEach(product => {
      const qty = formData.quantities[product.id] || 0;
      if (qty <= 0) {
        newErrors[`qty-${product.id}`] = 'Quantity must be greater than 0';
      } else if (qty > product.available_qty) {
        newErrors[`qty-${product.id}`] = `Quantity exceeds available stock (${product.available_qty})`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    const items = products.map(product => ({
      productId: product.id,
      productName: product.productName,
      qty: formData.quantities[product.id],
      unit: product.unit,
      price_per_unit: product.price_per_unit
    }));

    const payload = {
      customerId: userProfile?.id || 'u1',
      farmerId: farmer.id,
      items,
      eventType: formData.eventType,
      deliveryDate: formData.deliveryDate,
      deliveryAddress: formData.deliveryAddress,
      contactPhone: formData.contactPhone,
      notes: formData.notes
    };

    console.log('BulkOrderForm: Submitting bulk order');
    console.log('BulkOrderForm: Payload:', payload);
    console.log('BulkOrderForm: Endpoint: http://localhost:5000/api/special-orders');

    try {
      const response = await fetch('http://localhost:5000/api/special-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('BulkOrderForm: Response status:', response.status);
      console.log('BulkOrderForm: Response headers:', response.headers);

      if (response.ok) {
        console.log('BulkOrderForm: Bulk order submitted successfully');
        alert('Bulk order request submitted successfully! The farmer will contact you soon.');
        onClose();
      } else {
        const error = await response.json();
        console.error('BulkOrderForm: Error response:', error);
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('BulkOrderForm: Network error submitting order:', error);
      alert('Error submitting order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>🌾 Bulk Order Request</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="farmer-summary">
            <h3>Farmer: {farmer.name}</h3>
          </div>

          <div className="products-summary">
            <h3>Selected Products</h3>
            {products.map(product => (
              <div key={product.id} className="product-summary">
                <span>{product.productName} - ₹{product.price_per_unit}/{product.unit}</span>
                <div className="quantity-input">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max={product.available_qty}
                    value={formData.quantities[product.id] || ''}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                  />
                  <span>{product.unit} (max: {product.available_qty})</span>
                </div>
                {errors[`qty-${product.id}`] && <p className="error">{errors[`qty-${product.id}`]}</p>}
              </div>
            ))}
            <div className="total-cost">
              <strong>Total Cost: ₹{calculateTotal()}</strong>
            </div>
          </div>

          <div className="form-group">
            <label>Event Type:</label>
            <select name="eventType" value={formData.eventType} onChange={handleChange}>
              <option value="">Select event type</option>
              <option value="Wedding">Wedding</option>
              <option value="Birthday">Birthday</option>
              <option value="Corporate">Corporate Event</option>
              <option value="Festival">Festival</option>
              <option value="Other">Other</option>
            </select>
            {errors.eventType && <p className="error">{errors.eventType}</p>}
          </div>

          <div className="form-group">
            <label>Delivery Date:</label>
            <input
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
            />
            {errors.deliveryDate && <p className="error">{errors.deliveryDate}</p>}
          </div>

          <div className="form-group">
            <label>Delivery Address:</label>
            <textarea
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleChange}
              placeholder="Enter full delivery address"
            />
            {errors.deliveryAddress && <p className="error">{errors.deliveryAddress}</p>}
          </div>

          <div className="form-group">
            <label>Contact Phone:</label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
            />
            {errors.contactPhone && <p className="error">{errors.contactPhone}</p>}
          </div>

          <div className="form-group">
            <label>Additional Notes:</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any special instructions..."
            />
          </div>

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Request Bulk Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BulkOrderForm;
