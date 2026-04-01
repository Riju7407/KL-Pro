import React from 'react';
import './Bookings.css';

function Bookings() {
  const bookings = [
    {
      id: 1,
      service: 'Hair Spa',
      professional: 'Priya Sharma',
      date: '2024-02-15',
      time: '10:00 AM',
      status: 'confirmed',
      price: 500,
    },
    {
      id: 2,
      service: 'Facial',
      professional: 'Anjali Verma',
      date: '2024-02-20',
      time: '2:00 PM',
      status: 'pending',
      price: 700,
    },
  ];

  return (
    <div className="bookings">
      <h1>My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>No bookings yet. Start booking a service!</p>
          <button>Browse Services</button>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-info">
                <h3>{booking.service}</h3>
                <p><strong>Professional:</strong> {booking.professional}</p>
                <p><strong>Date & Time:</strong> {booking.date} at {booking.time}</p>
                <p><strong>Amount:</strong> ₹{booking.price}</p>
              </div>
              <div className="booking-status">
                <span className={`status-badge ${booking.status}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
                <div className="booking-actions">
                  <button className="btn-reschedule">Reschedule</button>
                  <button className="btn-cancel">Cancel</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bookings;
