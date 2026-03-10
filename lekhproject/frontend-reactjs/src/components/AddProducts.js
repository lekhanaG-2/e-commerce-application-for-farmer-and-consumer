import React, { useState } from 'react';

const AddProduct = ({ onAddProduct }) => {
  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    quantity: '',
    category: '',
    description: '',
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
    if (!onAddProduct) return;

    try {
      setSubmitting(true);
      setError(null);

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.productName);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const response = await onAddProduct(formDataToSend);

      if (response && response.product) {
        alert('Product added successfully: ' + formData.productName);

        // Reset form
        setFormData({
          productName: '',
          price: '',
          quantity: '',
          category: '',
          description: '',
        });
        setImageFile(null);
        setImagePreview(null);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to add product. Please try again.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-product-container">
      <h2>Add Product</h2>
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
          {submitting ? 'Adding Product...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
