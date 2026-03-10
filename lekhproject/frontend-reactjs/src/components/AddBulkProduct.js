import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { farmerAPI } from '../services/api';

const AddBulkProduct = ({ onAddProduct }) => {
  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    quantity: '',
    category: '',
    description: '',
    minimumOrder: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('AddBulkProduct: Starting form submission');
    console.log('AddBulkProduct: Form data:', formData);
    console.log('AddBulkProduct: Image file:', imageFile ? 'present' : 'none');

    try {
      setSubmitting(true);
      setError(null);

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.productName);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('minimumOrder', formData.minimumOrder);
      formDataToSend.append('product_type', 'bulk'); // Set product type to bulk
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      console.log('AddBulkProduct: FormData prepared, calling farmerAPI.addProduct');

      const response = await farmerAPI.addProduct(formDataToSend);

      console.log('AddBulkProduct: API response received:', response);

      if (response && response.product) {
        console.log('AddBulkProduct: Product added successfully:', response.product);
        toast.success('✅ Bulk product added successfully!');

        // Reset form
        setFormData({
          productName: '',
          price: '',
          quantity: '',
          category: '',
          description: '',
          minimumOrder: '',
        });
        setImageFile(null);
        setImagePreview(null);

        // Trigger dashboard refresh by dispatching custom event
        window.dispatchEvent(new CustomEvent('productAdded'));
      } else {
        console.error('AddBulkProduct: Unexpected response format:', response);
      }
    } catch (error) {
      console.error('AddBulkProduct: Error adding bulk product:', error);
      console.error('AddBulkProduct: Error response:', error.response);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to add bulk product. Please try again.';
      setError(errorMessage);
      toast.error('❌ Failed to add bulk product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-product-container">
      <h2>Add Bulk Purchase Product</h2>
      {error && (
        <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>
          {error}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="add-product-form"
        style={{ display: 'flex', flexDirection: 'column', rowGap: '16px' }}
      >
        <label>
          Product Name:
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            required
            disabled={submitting}
          />
        </label>
        <label>
          Price (₹/kg):
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            disabled={submitting}
          />
        </label>
        <label>
          Quantity (kg):
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            disabled={submitting}
          />
        </label>
        <label>
          Minimum Order (kg):
          <input
            type="number"
            name="minimumOrder"
            value={formData.minimumOrder}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            disabled={submitting}
          />
        </label>
        <label>
          Category:
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            disabled={submitting}
          >
            <option value="">Select a category</option>
            <option value="Fruits">Fruits</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Flowers">Flowers</option>
            <option value="Grains">Grains</option>
            <option value="Milk Products">Milk Products</option>
            <option value="Honey">Honey</option>
            <option value="Others">Others</option>
          </select>
        </label>
        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of the product"
            rows="3"
            disabled={submitting}
          />
        </label>
        <label>
          Product Image:
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={submitting}
          />
          {imagePreview && (
            <div style={{ marginTop: '10px' }}>
              <img
                src={imagePreview}
                alt="Product preview"
                style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ccc' }}
              />
            </div>
          )}
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Adding Product...' : 'Add Bulk Product'}
        </button>
      </form>
    </div>
  );
};

export default AddBulkProduct;