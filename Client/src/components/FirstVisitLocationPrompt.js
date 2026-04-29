import React, { useState, useEffect } from 'react';
import LocationPopup from './LocationPopup';

const FirstVisitLocationPrompt = () => {
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  useEffect(() => {
    // Check if user has already seen the location prompt
    const hasSeenLocationPrompt = localStorage.getItem('hasSeenLocationPrompt');

    if (!hasSeenLocationPrompt) {
      // Show popup after a short delay to let the page load
      const timer = setTimeout(() => {
        setShowLocationPopup(true);
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    }
  }, []);

  const handleLocationUpdate = (newLocation) => {
    // Mark that user has seen the location prompt
    localStorage.setItem('hasSeenLocationPrompt', 'true');
    setShowLocationPopup(false);

    // You could also save the location to localStorage or user preferences here
    localStorage.setItem('userPreferredLocation', newLocation);

    // Optional: Show a success message or redirect
    console.log('Location set to:', newLocation);
  };

  const handleClose = () => {
    // Mark that user has seen the location prompt even if they close it
    localStorage.setItem('hasSeenLocationPrompt', 'true');
    setShowLocationPopup(false);
  };

  return (
    <LocationPopup
      isOpen={showLocationPopup}
      onClose={handleClose}
      onLocationUpdate={handleLocationUpdate}
      autoShow={true}
      onAutoClose={handleClose}
    />
  );
};

export default FirstVisitLocationPrompt;