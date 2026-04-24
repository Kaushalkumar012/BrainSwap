import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// Environment variable format: https://backend.com (without /api)
// We append /api in the baseURL below
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_BASE = `${API_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
