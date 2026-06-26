//src/api/api.js
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://blissbloomlybackend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Add Firebase token to every request automatically
api.interceptors.request.use(async (config) => {
  try {
    const authInstance = getAuth();
    if (authInstance && authInstance.currentUser) {
      const token = await authInstance.currentUser.getIdToken(false);
      // Bulletproof header assignment for all Axios versions
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`
      };
    }
  } catch (error) {
    console.error("Error getting Firebase token", error);
  }
  return config;
}, (error) => Promise.reject(error));

// Global error logging
api.interceptors.response.use(
  response => response,
  error => {
    console.error('[API ERROR]', {
      url: error.config?.url,
      message: error.message,
      backendData: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default api;
