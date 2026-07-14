import axios from 'axios';

// In development, VITE_API_URL is empty → Vite proxy handles /api and /videos
// In production, VITE_API_URL = 'https://your-api.onrender.com'
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
});

export default api;
