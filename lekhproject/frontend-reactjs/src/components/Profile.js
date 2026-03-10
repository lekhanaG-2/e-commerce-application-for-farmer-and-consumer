import React, { useState, useEffect } from 'react';
import { farmerAPI } from '../services/api';

const Profile = ({ profileData, onUpdateProfile }) => {
  const [formData, setFormData] = useState({
    name: '',
    farmType: '',
    location: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Fetch profile data from backend
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await farmerAPI.getProfile();
      setFormData({
        name: profile.name || '',
        farmType: profile.farmType || '',
        location: profile.location || '',
        phone: profile.phone || '',
        email: profile.email || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);

      // Check if it's an authentication error
      if (error.message.includes('401') || error.message.includes('403') || error.message.includes('Unauthorized')) {
        setError('Please log in to view your profile');
        // Clear localStorage if token is invalid
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('userName');
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError('Failed to load profile data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update form data when profileData prop changes (primary method)
  useEffect(() => {
    if (profileData && Object.keys(profileData).length > 0) {
      setFormData({
        name: profileData.name || '',
        farmType: profileData.farmType || '',
        location: profileData.location || '',
        phone: profileData.phone || '',
        email: profileData.email || '',
      });
      setLoading(false); // Data is available, stop loading
    } else {
      // Only fetch from API if no profile data is provided
      fetchProfile();
    }
  }, [profileData]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const response = await farmerAPI.updateProfile(formData);

      if (response.user) {
        // Update local state
        setFormData({
          name: response.user.name || '',
          farmType: response.user.farmType || '',
          location: response.user.location || '',
          phone: response.user.phone || '',
          email: response.user.email || '',
        });

        // Update parent component
        if (onUpdateProfile) {
          onUpdateProfile(response.user);
        }

        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <h2>Profile</h2>
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <h2>Profile</h2>
        <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={updating}
          />
        </label>
        <label>
          Farm Type:
          <input
            type="text"
            name="farmType"
            value={formData.farmType}
            onChange={handleChange}
            required
            disabled={updating}
          />
        </label>
        <label>
          Location:
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            disabled={updating}
          />
        </label>
        <label>
          Phone:
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={updating}
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={updating}
          />
        </label>
        <button type="submit" disabled={updating}>
          {updating ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
