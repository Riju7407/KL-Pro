import React, { useState, useEffect } from 'react';
import './HeroCarousel.css';

function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const images = [
    '/c2.png',
    '/HS2.png',
    '/M2.png',
    '/MG2.png',
    '/SS2.png',
    '/SS3.png'
  ];

  // Auto-scroll carousel every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + images.length) % images.length);
  };

  return (
    <section className="hero-carousel">
      <div className="carousel-container">
        <div className="carousel-wrapper">
          {images.map((image, index) => (
            <div
              key={index}
              className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <button className="carousel-btn prev" onClick={prevSlide} aria-label="Previous slide">
          ‹
        </button>
        <button className="carousel-btn next" onClick={nextSlide} aria-label="Next slide">
          ›
        </button>

        {/* Dots Indicators */}
        <div className="carousel-dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroCarousel;
