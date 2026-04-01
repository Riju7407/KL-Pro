// API Configuration
// Priority: environment variable > production default > development default
const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';

const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (isDevelopment 
    ? 'http://localhost:5000/api'
    : 'https://kl-pro.onrender.com/api');

export default API_BASE_URL;
