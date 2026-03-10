import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaQuestionCircle, FaPaperPlane, FaHeadset, FaArrowLeft } from 'react-icons/fa';
import { submitContactForm } from '../services/api';
import './HelpPage.css';

const HelpPage = () => {
  const navigate = useNavigate();
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showChat, setShowChat] = useState(false);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitContact = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await submitContactForm(contactData);
      setMessage('Your message has been sent successfully! We will get back to you soon.');
      setContactData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setMessage('Failed to submit your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const faqs = [
    {
      question: 'How do I place an order?',
      answer: 'Browse products, add to cart, proceed to checkout, select address and payment method.'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept credit/debit cards, UPI, and net banking.'
    },
    {
      question: 'How long does delivery take?',
      answer: 'Standard delivery within 2-3 days. Express options available in select areas.'
    },
    {
      question: 'What is your return policy?',
      answer: 'Fresh produce returns accepted within 24 hours if not as described.'
    },
    {
      question: 'How can I track my order?',
      answer: 'Track your order status in the Orders section of your profile.'
    }
  ];

  return (
    <div className="help-page">
      <div className="help-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h1 className="help-title">
          <FaQuestionCircle /> Help & Support
        </h1>
      </div>

      <div className="help-content">
        <div className="faqs-contact-container">
          <section className="faqs-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faqs">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="contact-section">
            <h2>Still need help? Contact Us</h2>
            <form onSubmit={handleSubmitContact} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={contactData.name}
                  onChange={handleContactChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={contactData.email}
                  onChange={handleContactChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={contactData.message}
                  onChange={handleContactChange}
                  rows="5"
                  required
                  placeholder="Describe your issue or question..."
                ></textarea>
              </div>
              <button type="submit" disabled={submitting} className="submit-button">
                <FaPaperPlane /> {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
            {message && (
              <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}
          </section>
        </div>

        <section className="chat-section">
          <h2>Live Chat</h2>
          <p>Connect with our support team instantly.</p>
          <button onClick={toggleChat} className="chat-button">
            <FaHeadset /> {showChat ? 'Close Chat' : 'Start Chat'}
          </button>
          {showChat && (
            <div className="chat-placeholder">
              <p>Live chat functionality coming soon. In the meantime, please use the contact form above.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HelpPage;
