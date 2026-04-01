import React from 'react';
import './Professionals.css';

function Professionals() {
  const professionals = [
    {
      id: 1,
      name: 'Priya Sharma',
      specialization: 'Hair Stylist',
      rating: 4.9,
      reviews: 234,
      availability: 'Available Today',
      location: 'Lucknow',
      experience: '5+ years',
    },
    {
      id: 2,
      name: 'Anjali Verma',
      specialization: 'Beauty Therapist',
      rating: 4.8,
      reviews: 167,
      availability: 'Available Tomorrow',
      location: 'Lucknow',
      experience: '7+ years',
    },
    {
      id: 3,
      name: 'Neha Mishra',
      specialization: 'Spa Therapist',
      rating: 4.7,
      reviews: 145,
      availability: 'Available Today',
      location: 'Lucknow',
      experience: '4+ years',
    },
    {
      id: 4,
      name: 'Ritika Singh',
      specialization: 'Makeup Artist',
      rating: 4.9,
      reviews: 189,
      availability: 'Available in 2 days',
      location: 'Lucknow',
      experience: '6+ years',
    },
  ];

  return (
    <div className="professionals">
      <h1>Meet Our Professionals</h1>
      <p className="subtitle">Verified and experienced professionals ready to serve you</p>

      <div className="professionals-grid">
        {professionals.map((prof) => (
          <div key={prof.id} className="professional-card">
            <div className="prof-avatar">{prof.name.charAt(0)}</div>
            <h3>{prof.name}</h3>
            <p className="specialization">{prof.specialization}</p>
            <div className="prof-details">
              <p><strong>Location:</strong> {prof.location}</p>
              <p><strong>Experience:</strong> {prof.experience}</p>
              <p><strong>Rating:</strong> ⭐ {prof.rating} ({prof.reviews} reviews)</p>
              <p className="availability"><strong>Availability:</strong> {prof.availability}</p>
            </div>
            <button className="btn-hire">Hire Professional</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Professionals;
