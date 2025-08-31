// API utility for handling base URL configuration
// Using REACT_APP_API_URL to match Render environment variable
const API_BASE = import.meta.env.REACT_APP_API_URL || 'http://localhost:3000';

export const apiCall = (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  return fetch(url, options);
};

export default API_BASE; 