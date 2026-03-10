import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './LoginPage.css';

function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/users/login', { email, password });
      const { token, user } = response.data;
      if (user.role !== 'admin') {
        setError('Access denied. Admin login required.');
        return;
      }
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/admin');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMsg);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Admin Login</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@farm2home.com"
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
          <button type="submit" className="login-button">
            Login as Admin
          </button>
        </form>
        <p><a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} className="login-link">Back to User Login</a></p>
      </div>
    </div>
  );
}

export default AdminLoginPage;
