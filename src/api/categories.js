//src/api/categories.js
import api from './api';

export const fetchCategories = () => api.get('/categories');