import React from 'react';
import './HelpCenter.css';

function HelpCenter() {
  return (
    <div className="help-center-page">
      <div className="container">
        <div className="help-content">
          <h1>Help Center</h1>
          <p className="help-meta">Find guides, support articles, and quick answers to common questions.</p>

          <section>
            <h2>Getting Started</h2>
            <p>Need help placing your first booking or understanding how KLPro works? Start here.</p>
            <ul>
              <li><strong>Create an account:</strong> Sign up with your email or mobile number and complete your profile.</li>
              <li><strong>Book a service:</strong> Browse services, choose a professional, and confirm the date and time.</li>
              <li><strong>Manage bookings:</strong> View, cancel, or reschedule your active bookings at any time from your dashboard.</li>
            </ul>
          </section>

          <section>
            <h2>Payment & Billing</h2>
            <p>Everything you need to know about payments, invoices, and secure checkout.</p>
            <ul>
              <li><strong>Secure payment:</strong> We use trusted payment processors to keep your payment details safe.</li>
              <li><strong>Invoice details:</strong> You can download receipts for every completed service from your booking history.</li>
              <li><strong>Refund policy:</strong> For cancellations and disputes, please refer to our cancellation terms in the booking details.</li>
            </ul>
          </section>

          <section>
            <h2>Service Support</h2>
            <p>Our support team is ready to help if you need assistance with a service request.</p>
            <ul>
              <li><strong>Track your professional:</strong> Check the status of a service and see the expected arrival time.</li>
              <li><strong>Report an issue:</strong> If a professional does not arrive or service quality is not satisfactory, contact support immediately.</li>
              <li><strong>Service feedback:</strong> Rate your experience and leave details to help us improve.</li>
            </ul>
          </section>

          <section>
            <h2>Need Personal Assistance?</h2>
            <p>If your issue is urgent or specific to your account, reach out directly to our support team:</p>
            <div className="support-contact">
              <div>
                <h3>Email Support</h3>
                <p>info@klproind.com</p>
              </div>
              <div>
                <h3>Phone Support</h3>
                <p>+91 9711379156</p>
              </div>
            </div>
          </section>

          <div className="help-footer">
            <p>© 2026 KLPro Pvt Ltd. Your trusted partner for home and professional services.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpCenter;
