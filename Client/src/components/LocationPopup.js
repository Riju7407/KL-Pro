import React, { useState, useEffect } from 'react';
import './LocationPopup.css';

const LocationPopup = ({ isOpen, onClose, onLocationUpdate, currentLocation = '', autoShow = false, onAutoClose }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState('');
  const [detectedLocation, setDetectedLocation] = useState('');
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    if (autoShow && !isOpen) {
      // Flash animation for auto-show
      setShowFlash(true);
      const timer = setTimeout(() => setShowFlash(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [autoShow, isOpen]);

  const handleClose = () => {
    if (autoShow && onAutoClose) {
      onAutoClose();
    } else {
      onClose();
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Your browser does not support location detection.');
      return;
    }

    setIsDetecting(true);
    setError('');
    setDetectedLocation('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=en&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                Accept: 'application/json',
                'Accept-Language': 'en',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to detect your current city');
          }

          const data = await response.json();
          const cityFromGeo =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.county ||
            data?.address?.state ||
            '';

          if (!cityFromGeo) {
            throw new Error('Could not detect city from your current location');
          }

          setDetectedLocation(cityFromGeo);
          setError('');
        } catch (locationError) {
          setError(locationError.message || 'Unable to detect your current city');
        } finally {
          setIsDetecting(false);
        }
      },
      (locationError) => {
        setIsDetecting(false);
        setError('Please allow location permission to use current location');
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  };

  const handleConfirmLocation = () => {
    if (detectedLocation) {
      onLocationUpdate(detectedLocation);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`location-popup-overlay ${showFlash ? 'flash' : ''}`}>
      <div className="location-popup">
        <div className="location-popup-header">
          <h3>Update Location</h3>
          <button type="button" className="location-popup-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="location-popup-content">
          <p className="location-popup-description">
            Update your current location to help us provide better service recommendations and connect you with nearby professionals.
          </p>

          {currentLocation && (
            <div className="location-popup-current">
              <strong>Current Location:</strong> {currentLocation}
            </div>
          )}

          <div className="location-popup-actions">
            <button
              type="button"
              className="location-popup-button primary"
              onClick={handleUseCurrentLocation}
              disabled={isDetecting}
            >
              {isDetecting ? 'Detecting Location...' : 'Use My Current Location'}
            </button>
          </div>

          {detectedLocation && (
            <div className="location-popup-detected">
              <p><strong>Detected Location:</strong> {detectedLocation}</p>
              <button
                type="button"
                className="location-popup-button confirm"
                onClick={handleConfirmLocation}
              >
                Confirm & Update Location
              </button>
            </div>
          )}

          {error && (
            <div className="location-popup-error">
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationPopup;