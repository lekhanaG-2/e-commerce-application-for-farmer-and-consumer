import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/api';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    profile_photo: null
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (!userString) {
      navigate('/login');
      return;
    }

    // Initialize from localStorage as fallback
    const user = JSON.parse(userString);
    setProfile({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      profile_photo: user.profile_photo || null
    });
    if (user.profile_photo) {
      setPhotoPreview(`http://localhost:5002${user.profile_photo}`);
    }

    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          profile_photo: data.profile_photo || null
        });
        if (data.profile_photo) {
          setPhotoPreview(`http://localhost:5002${data.profile_photo}`);
        }
        setError(''); // Clear any previous error on success
      } catch (err) {
        setError('Failed to load profile from server (using local data)');
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = { ...profile };
      if (photoFile) {
        updateData.photo = photoFile;
      }
      const response = await updateProfile(updateData);
      setProfile(prev => ({ ...prev, ...response.user }));
      setSuccess('Profile updated successfully');
      // Update localStorage user with all profile fields
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        Object.assign(user, response.user);
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>My Profile</h1>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="photo-section">
            <label htmlFor="photo">Profile Photo</label>
            <div className="photo-upload">
              {photoPreview && <img src={photoPreview} alt="Profile Preview" className="photo-preview" />}
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profile.phone}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={profile.address}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          <button type="submit" disabled={loading} className="update-btn">
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
