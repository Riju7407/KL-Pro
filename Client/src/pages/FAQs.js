import React from 'react';
import './FAQs.css';

function FAQs() {
  return (
    <div className="faqs-page">
      <div className="container">
        <div className="faqs-content">
          <h1>Frequently Asked Questions</h1>
          <p className="faqs-meta">Answers to the most common questions about using KLPro.</p>

          <section className="faq-item">
            <h2>How do I book a service?</h2>
            <p>Choose a service category, browse available professionals, select a date and time, then confirm your booking. You can manage bookings later from your account dashboard.</p>
          </section>

          <section className="faq-item">
            <h2>Can I cancel or reschedule a booking?</h2>
            <p>Yes. Open the booking details in your dashboard and choose cancel or reschedule according to the provider's cancellation policy. Some bookings may have a time limit.</p>
          </section>

          <section className="faq-item">
            <h2>What payment methods are accepted?</h2>
            <p>We accept major debit and credit cards, UPI, digital wallets, and net banking. All payments are processed securely through trusted third-party gateways.</p>
          </section>

          <section className="faq-item">
            <h2>How do I contact support?</h2>
            <p>Visit the Help Center page for support email and phone details, or send a message through the contact section in the app.</p>
          </section>

          <section className="faq-item">
            <h2>How can I leave a review?</h2>
            <p>After your service is completed, go to the booking record and submit a rating and feedback for the professional. This helps us maintain quality.</p>
          </section>

          <section className="faq-item">
            <h2>Is my personal information safe?</h2>
            <p>Yes. We protect your data with encryption and secure handling practices. Read our Privacy Policy page for full details.</p>
          </section>

          <div className="faqs-footer">
            <p>© 2026 KLPro Pvt Ltd. For additional questions, check our Help Center or contact support.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQs;
