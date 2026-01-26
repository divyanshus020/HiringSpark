import axios from "axios";

const getBaseURL = () => {
  // In development (localhost), use the env var or local fallback
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  }

  // In production (e.g. hirespark.hiringbazaar.in), use full URL /api
  // This is more explicit for proxy configurations
  return `${window.location.origin}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('isAuth');

      // Redirect to appropriate auth page based on current path
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/admin')) {
        window.location.href = '/admin/auth';
      } else {
        window.location.href = '/hr/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
