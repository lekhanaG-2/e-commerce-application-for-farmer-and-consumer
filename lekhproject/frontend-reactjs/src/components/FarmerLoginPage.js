import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './FarmerLoginPage.css';

function FarmerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/users/login', { email, password });
      const { token, user } = response.data;

      // Verify user is a farmer
      if (user.role !== 'farmer') {
        setError('This login page is for farmers only. Please use the regular login page.');
        return;
      }

      login({ ...user, token });

      // Navigate to farmer dashboard
      navigate('/farmer/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMsg);
    }
  };

  return (
    <div className="farmer-login-page">
      <div className="farmer-login-container">
        <h2>Farmer Login</h2>
        <p className="farmer-login-subtitle">Access your farming dashboard</p>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@example.com"
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>
          <button type="submit" className="farmer-login-button">
            Login as Farmer
          </button>
        </form>
        <p>Looking for consumer login? <a href="/login" className="farmer-login-link">Consumer Login</a></p>
      </div>
    </div>
  );
}

export default FarmerLoginPage;
