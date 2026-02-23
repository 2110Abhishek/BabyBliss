//src/api/api.js
import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://blissbloomlybackend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Global error logging
api.interceptors.response.use(
  response => response,
  error => {
    console.error('[API ERROR]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
