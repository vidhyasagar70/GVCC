import axios from 'axios';

// Fail-safe automatic backend resolution
let baseURL = import.meta.env.VITE_API_URL ?? '';

if (!baseURL && typeof window !== 'undefined') {
  if (window.location.hostname.includes('vercel.app')) {
    baseURL = 'https://gvcc-3ivq.onrender.com';
  }
}

const api = axios.create({
  baseURL,
});

export { baseURL };
export default api;
