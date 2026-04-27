import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/apiConfig';
import './Contact.css';


function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState({ success: null, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for user token in localStorage
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    setIsAuthenticated(!!token);
    // Optionally, autofill user info if available
    if (token) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        setFormData((prev) => ({
          ...prev,
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
        }));
      } catch {}
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: null, message: '' });

    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ success: false, message: 'Please fill in your name, email, and message.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to submit your request.');
      }

      setStatus({ success: true, message: 'Your message has been sent successfully. We will contact you soon.' });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      setStatus({ success: false, message: error.message || 'Submission failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="container">
        <div className="contact-card">
          <div className="contact-intro">
            <h1>Contact Us</h1>
            <p>Need help or have a question? Send your message and our team will get back to you shortly.</p>
            <div className="contact-details-panel">
              <article>
                <h3>Email</h3>
                <p>info@klproind.com</p>
              </article>
              <article>
                <h3>Phone</h3>
                <p>+91 9711379156</p>
              </article>
              <article>
                <h3>Operating Hours</h3>
                <p>Mon - Sat, 9:00 AM - 7:00 PM</p>
              </article>
            </div>
          </div>

          {isAuthenticated ? (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="form-row">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-row">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9711379156"
                />
              </div>

              <div className="form-row">
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                />
              </div>

              <div className="form-row">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  required
                />
              </div>

              {status.message && (
                <div className={`form-status ${status.success ? 'success' : 'error'}`}>
                  {status.message}
                </div>
              )}

              <button type="submit" className="contact-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          ) : (
            <div className="contact-login-prompt">
              <p><b>Please <a href="/login">log in</a> to use the contact form.</b></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Contact;
