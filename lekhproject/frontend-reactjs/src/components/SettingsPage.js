import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSave, FaArrowLeft, FaEnvelope, FaBell, FaLock, FaPaperPlane, FaShieldAlt, FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { getProfile, updateProfile, changePassword, updateNotificationPreferences, submitContactForm } from '../services/api';
import './SettingsPage.css';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [userProfile, setUserProfile] = useState({
    name: '',
    mobile: '',
    email: '',
    email_notifications: false,
    push_notifications: false,
    sms_notifications: false,
    allow_data_sharing: false,
    marketing_emails: false
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [submittingContact, setSubmittingContact] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        const profile = response.data;
        setUserProfile(prev => ({
          ...prev,
          name: profile.name || '',
          mobile: profile.phone || '',
          email: profile.email || '',
          email_notifications: profile.email_notifications || false,
          push_notifications: profile.push_notifications || false,
          sms_notifications: profile.sms_notifications || false,
          allow_data_sharing: profile.allow_data_sharing || false,
          marketing_emails: profile.marketing_emails || false
        }));
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.className = savedTheme === 'dark' ? 'dark-mode' : '';
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handlePrivacyChange = (e) => {
    const { name, checked } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await updateProfile(userProfile);
      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match.');
      return;
    }
    setChangingPassword(true);
    setMessage('');
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage('Failed to change password. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSubmitContact = async () => {
    setSubmittingContact(true);
    setMessage('');
    try {
      await submitContactForm(contactData);
      setMessage('Contact form submitted successfully!');
      setContactData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setMessage('Failed to submit contact form. Please try again.');
    } finally {
      setSubmittingContact(false);
    }
  };

  if (loading) {
    return <div className="settings-loading">Loading settings...</div>;
  }

  return (
    <div className={`settings-page ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <div className="settings-container">
        <div className="settings-header">
          <button className="back-button" onClick={() => navigate('/')}>
            <FaArrowLeft /> Back to Dashboard
          </button>
          <h1 className="settings-title">
            <FaUser className="settings-icon" />
            Account Settings
          </h1>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h2>Personal Information</h2>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={userProfile.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="mobile">Mobile Number</label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={userProfile.mobile}
                onChange={handleInputChange}
                placeholder="Enter your mobile number"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={userProfile.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <div className="settings-section">
            <h2><FaBell /> Notification Preferences</h2>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="email_notifications"
                  checked={userProfile.email_notifications}
                  onChange={handleNotificationChange}
                />
                Email Notifications
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="push_notifications"
                  checked={userProfile.push_notifications}
                  onChange={handleNotificationChange}
                />
                Push Notifications
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="sms_notifications"
                  checked={userProfile.sms_notifications}
                  onChange={handleNotificationChange}
                />
                SMS Notifications
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h2><FaLock /> Change Password</h2>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
              />
            </div>
            <button
              className="save-button"
              onClick={handleChangePassword}
              disabled={changingPassword}
            >
              {changingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </div>

          <div className="settings-section">
            <h2><FaShieldAlt /> Privacy Settings</h2>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="allow_data_sharing"
                  checked={userProfile.allow_data_sharing}
                  onChange={handlePrivacyChange}
                />
                Allow data sharing for personalized recommendations
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="marketing_emails"
                  checked={userProfile.marketing_emails}
                  onChange={handlePrivacyChange}
                />
                Receive marketing emails and promotions
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h2>Theme</h2>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                />
                Dark Mode
                {theme === 'dark' ? <FaMoon /> : <FaSun />}
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h2><FaPaperPlane /> Contact Us</h2>
            <div className="form-group">
              <label htmlFor="contactName">Name</label>
              <input
                type="text"
                id="contactName"
                name="name"
                value={contactData.name}
                onChange={handleContactChange}
                placeholder="Your name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="contactEmail">Email</label>
              <input
                type="email"
                id="contactEmail"
                name="email"
                value={contactData.email}
                onChange={handleContactChange}
                placeholder="Your email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="contactMessage">Message</label>
              <textarea
                id="contactMessage"
                name="message"
                value={contactData.message}
                onChange={handleContactChange}
                placeholder="Your message"
                rows="4"
              ></textarea>
            </div>
            <button
              className="save-button"
              onClick={handleSubmitContact}
              disabled={submittingContact}
            >
              {submittingContact ? 'Submitting...' : 'Submit'}
            </button>
          </div>

          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="settings-actions">
            <button
              className="save-button"
              onClick={handleSave}
              disabled={saving}
            >
              <FaSave />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
