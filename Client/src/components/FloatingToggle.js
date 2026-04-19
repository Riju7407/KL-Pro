import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaFacebookF, FaInstagram, FaXTwitter, FaLinkedinIn } from 'react-icons/fa6';
import './FloatingToggle.css';

function FloatingToggle() {
  const [hideButtons, setHideButtons] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Detect if footer is in view
      const footer = document.querySelector('footer');
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        // Hide buttons if footer is visible on screen
        setHideButtons(footerRect.top < window.innerHeight);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`floating-toggle-container ${hideButtons ? 'hide-buttons' : ''}`}>
      {/* Always visible social links - hidden when footer is in view */}
      <div className={`social-menu ${hideButtons ? 'hidden' : ''}`}>
        <a href="https://wa.me" target="_blank" rel="noopener noreferrer" className="social-link whatsapp" title="WhatsApp" aria-label="WhatsApp">
          <FaWhatsapp />
        </a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link facebook" title="Facebook" aria-label="Facebook">
          <FaFacebookF />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link instagram" title="Instagram" aria-label="Instagram">
          <FaInstagram />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link twitter" title="Twitter" aria-label="Twitter">
          <FaXTwitter />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link linkedin" title="LinkedIn" aria-label="LinkedIn">
          <FaLinkedinIn />
        </a>
      </div>
    </div>
  );
}

export default FloatingToggle;
