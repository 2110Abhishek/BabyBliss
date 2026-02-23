// src/api/index.js
const API_BASE = process.env.REACT_APP_API_BASE || 'https://blissbloomlybackend.onrender.com';

async function getJSON(url) {
  const res = await fetch(url, { credentials: 'same-origin' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status} ${res.statusText} ${text}`);
  }
  return res.json();
}

export const fetchProducts = async () => {
  return getJSON(`${API_BASE}/api/products`);
};

export const fetchProductById = async (id) => {
  return getJSON(`${API_BASE}/api/products/${id}`);
};
