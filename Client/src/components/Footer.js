import React, { useState, useEffect, useRef } from 'react';
import './Footer.css';

function Footer() {
  const [showSocial, setShowSocial] = useState(true);
  const [showToggle, setShowToggle] = useState(true);
  const footerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (footerRef.current) {
        const rect = footerRef.current.getBoundingClientRect();
        // Hide toggle button when footer comes into view (near bottom of viewport)
        if (rect.top < window.innerHeight) {
          setShowToggle(false);
        } else {
          setShowToggle(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <footer className="footer" ref={footerRef}>
      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-container">
            {/* Company Info */}
            <div className="footer-section">
              <div className="footer-logo">
                <img src="/kl.png" alt="KLPro Pvt Ltd" />
                <h3>KLPro Pvt Ltd</h3>
              </div>
              <p className="footer-desc">Professional home services at your doorstep. Connecting quality professionals with customers since 2024.</p>
            </div>

            {/* Services */}
            <div className="footer-section">
              <h3>Our Services</h3>
              <ul className="footer-links">
                <li><a href="/services">Women's Salon & Spa</a></li>
                <li><a href="/services">Men's Grooming</a></li>
                <li><a href="/services">Spa Services</a></li>
                <li><a href="/services">Hair Services</a></li>
                <li><a href="/services">Makeup</a></li>
                <li><a href="/services">Cleaning</a></li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul className="footer-links">
                <li><a href="/">Home</a></li>
                <li><a href="/services">Services</a></li>
                <li><a href="/professionals">Professionals</a></li>
                <li><a href="/bookings">My Bookings</a></li>
                <li><a href="/profile">Profile</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="footer-section">
              <h3>Support & Info</h3>
              <ul className="footer-links">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">FAQs</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms & Conditions</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-section">
              <h3>Contact & Follow</h3>
              <div className="contact-info">
                <p>📧 support@klservices.com</p>
                <p>📱 +91 XXXXXXXXXX</p>
              </div>
              <div className="social-links-wrapper">
                <div className={`social-links ${showSocial ? 'show' : 'hide'}`}>
                  <a href="#" title="Facebook" className="social-icon facebook">f</a>
                  <a href="#" title="Instagram" className="social-icon instagram">📷</a>
                  <a href="#" title="Twitter" className="social-icon twitter">𝕏</a>
                  <a href="#" title="LinkedIn" className="social-icon linkedin">in</a>
                </div>
                {showToggle && (
                  <button 
                    className="social-toggle"
                    onClick={() => setShowSocial(!showSocial)}
                    title={showSocial ? 'Hide social links' : 'Show social links'}
                  >
                    {showSocial ? '−' : '+'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>&copy; 2024 KLPro Pvt Ltd. All rights reserved.</p>

          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
