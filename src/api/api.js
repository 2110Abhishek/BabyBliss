//src/api/api.js
import axios from 'axios';
import { auth } from '../firebase/firebase';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://blissbloomlybackend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Add Firebase token to every request automatically
api.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken(false);
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error("Error getting Firebase token", error);
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Global error logging
api.interceptors.response.use(
  response => response,
  error => {
    console.error('[API ERROR]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
