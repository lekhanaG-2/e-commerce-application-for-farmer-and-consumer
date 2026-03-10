import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './RegistrationPage.css';

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await api.post('/api/users/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      setMessage('Registration successful! Logging you in...');
      // Automatically log in after successful registration
      const loginResponse = await api.post('/api/users/login', {
        email: formData.email,
        password: formData.password
      });
      const { token, user } = loginResponse.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/');
    } catch (err) {
      let errorMessage = err.response?.data?.error;
      if (err.response?.data?.errors && err.response.data.errors.length > 0) {
        errorMessage = err.response.data.errors.map(e => e.msg).join(', ');
      } else if (!errorMessage) {
        errorMessage = err.message || 'Registration failed';
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="registration-page">
      <div className="registration-container">
        <h2>Consumer Registration</h2>
        {error && <p className="error">{error}</p>}
        {message && <p className="message">{message}</p>}

        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
          <button type="submit">Submit</button>
        </form>

        <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Login</a></p>
      </div>
    </div>
  );
};

export default RegistrationPage;
