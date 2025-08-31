// API utility for handling base URL configuration
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const apiCall = (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  return fetch(url, options);
};

export default API_BASE; 