import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: `${API_URL}/api` });

// Attach JWT (Remember Me -> localStorage, otherwise sessionStorage)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize error message + auto-logout on expired session
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || 'Network error. Is the backend running?';
    if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
    return Promise.reject(new Error(message));
  }
);

export function setToken(token, rememberMe) {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  if (rememberMe) localStorage.setItem('token', token);
  else sessionStorage.setItem('token', token);
}

export function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

export function clearToken() {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
}

export default api;
