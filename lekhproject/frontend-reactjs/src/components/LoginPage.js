import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './LoginPage.css';

function LoginPage() {
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

      // Prevent admins and farmers from logging in through consumer login page
      if (user.role === 'admin') {
        setError('Admins must use the admin login page. Redirecting...');
        setTimeout(() => {
          navigate('/super-secret-admin');
        }, 2000);
        return;
      }

      if (user.role === 'farmer') {
        setError('Farmers must use the farmer login page. Redirecting...');
        setTimeout(() => {
          navigate('/farmer/login');
        }, 2000);
        return;
      }

      login({ ...user, token });

      // Role-based navigation for consumers and farmers only
      if (user.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else {
        // Consumer login - redirect to home
        navigate('/');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMsg);
      if (errorMsg.includes('not found') || errorMsg.includes('Invalid credentials')) {
        navigate('/register');
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Consumer Login</h2>
        <p className="login-description">Login as a consumer to browse and purchase fresh produce from local farmers.</p>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
            Login
          </button>
        </form>
        <p>Don't have an account? <a href="/register" className="login-link">Register</a></p>
        <p>Want to sell as a farmer? <a href="/farmer/login" className="login-link">Login as Farmer</a> | <a href="/farmer/register" className="login-link">Register as Farmer</a></p>
      </div>
    </div>
  );
}

export default LoginPage;
