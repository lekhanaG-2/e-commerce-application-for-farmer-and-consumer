import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './FarmerRegistrationPage.css';

const FarmerRegistrationPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    farmName: '',
    location: '',
    farmSize: '',
    farmingType: '',
    experience: '',
    certifications: [],
    idProof: null
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const farmingTypes = ['Organic', 'Conventional', 'Mixed', 'Hydroponic', 'Aquaponic'];
  const certificationOptions = ['Organic Certified', 'GAP Certified', 'Fair Trade', 'Non-GMO', 'Other'];

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === 'idProof') {
      setFormData({ ...formData, [name]: files[0] });
    } else if (type === 'checkbox') {
      if (checked) {
        setFormData({ ...formData, certifications: [...formData.certifications, value] });
      } else {
        setFormData({ ...formData, certifications: formData.certifications.filter(cert => cert !== value) });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.name && formData.email && formData.phone && formData.password && formData.confirmPassword;
      case 2:
        return formData.farmName && formData.location && formData.farmingType;
      case 3:
        return formData.idProof;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      setError('');
    } else {
      setError('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('farmName', formData.farmName);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('farmSize', formData.farmSize);
      formDataToSend.append('farmingType', formData.farmingType);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('certifications', JSON.stringify(formData.certifications));
      if (formData.idProof) {
        formDataToSend.append('idProof', formData.idProof);
      }

      const response = await api.post('/api/users/farmer-register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Store the token and user data in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setMessage('Farmer registration successful! Redirecting to your dashboard...');
      setTimeout(() => navigate('/farmer/dashboard'), 2000);
    } catch (err) {
      let errorMessage = err.response?.data?.error;
      if (err.response?.data?.errors && err.response.data.errors.length > 0) {
        errorMessage = err.response.data.errors.map(e => e.msg).join(', ');
      } else if (!errorMessage) {
        errorMessage = err.message || 'Registration failed';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3].map(step => (
        <div key={step} className={`step ${currentStep >= step ? 'active' : ''}`}>
          <div className="step-number">{step}</div>
          <div className="step-label">
            {step === 1 ? 'Personal Info' : step === 2 ? 'Farm Details' : 'Verification'}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="form-step">
      <div className="step-header">
        <h3>👤 Personal Information</h3>
        <p>Tell us about yourself</p>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email Address *</label>
          <input
            type="email"
            name="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phone"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password *</label>
          <input
            type="password"
            name="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <div className="step-header">
        <h3>🌾 Farm Information</h3>
        <p>Share details about your farming operation</p>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>Farm Name *</label>
          <input
            type="text"
            name="farmName"
            placeholder="e.g., Green Valley Farm"
            value={formData.farmName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Farm Location *</label>
          <input
            type="text"
            name="location"
            placeholder="City, State, Country"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Farm Size (Optional)</label>
          <select name="farmSize" value={formData.farmSize} onChange={handleChange}>
            <option value="">Select farm size</option>
            <option value="small">Small (Under 5 acres)</option>
            <option value="medium">Medium (5-50 acres)</option>
            <option value="large">Large (50+ acres)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Farming Type *</label>
          <select name="farmingType" value={formData.farmingType} onChange={handleChange} required>
            <option value="">Select farming type</option>
            {farmingTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Years of Experience (Optional)</label>
          <select name="experience" value={formData.experience} onChange={handleChange}>
            <option value="">Select experience</option>
            <option value="0-2">0-2 years</option>
            <option value="3-5">3-5 years</option>
            <option value="6-10">6-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>
        <div className="form-group full-width">
          <label>Certifications (Optional)</label>
          <div className="certifications-grid">
            {certificationOptions.map(cert => (
              <label key={cert} className="certification-option">
                <input
                  type="checkbox"
                  name="certifications"
                  value={cert}
                  checked={formData.certifications.includes(cert)}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                {cert}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <div className="step-header">
        <h3>✅ Verification</h3>
        <p>Upload your identification documents</p>
      </div>
      <div className="verification-section">
        <div className="file-upload-card">
          <div className="upload-icon">📄</div>
          <h4>ID Proof / Certification *</h4>
          <p>Upload your farmer ID, certification, or any government-issued document</p>
          <div className="file-input-wrapper">
            <input
              type="file"
              id="idProof"
              name="idProof"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleChange}
              required
            />
            <label htmlFor="idProof" className="file-label">
              {formData.idProof ? formData.idProof.name : 'Choose file or drag here'}
            </label>
          </div>
          <small>Supported formats: PDF, JPG, PNG. Max size: 5MB</small>
        </div>
      </div>
    </div>
  );

  return (
    <div className="farmer-registration-page">
      <div className="registration-hero">
        <div className="hero-content">
          <h1>Join Farm2Home</h1>
          <p>Start your journey as a farmer and connect with customers who value fresh, local produce</p>
        </div>
      </div>

      <div className="farmer-registration-container">
        {renderStepIndicator()}

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          <div className="form-navigation">
            {currentStep > 1 && (
              <button type="button" className="btn-secondary" onClick={prevStep}>
                ← Previous
              </button>
            )}
            {currentStep < 3 ? (
              <button type="button" className="btn-primary" onClick={nextStep}>
                Next →
              </button>
            ) : (
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </form>

        <div className="auth-links">
          <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/farmer/login'); }}>Login here</a></p>
          <p>Want to shop instead? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Register as Consumer</a></p>
        </div>
      </div>
    </div>
  );
};

export default FarmerRegistrationPage;
