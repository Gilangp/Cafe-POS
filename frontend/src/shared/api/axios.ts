import axios, { AxiosRequestConfig } from 'axios';

// Browser: pakai path relatif -> diproxy oleh Next.js (tidak ada CORS)
// Server-side: pakai full URL langsung ke backend
const getBaseUrl = () => {
  // BYPASS NEXT.JS PROXY to prevent 'socket hang up' (ECONNRESET)
  // PHP artisan serve crashes when Next.js proxy keeps connections open.
  // We hit the backend directly. CORS is already enabled in Laravel.
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return `${base.replace(/\/api(\/v1)?\/?$/, '')}/api/v1`;
};

const API_BASE_URL = getBaseUrl();

const _axios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});

// Request interceptor: otomatis attach Bearer token dari localStorage jika ada
_axios.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          const token = parsed?.state?.token;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch {
        // abaikan error parsing
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: jika 401, redirect ke halaman login otomatis
_axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Custom fetch helper: memanggil GET dan mengembalikan response.data secara langsung.
 * Digunakan di halaman publik untuk kemudahan konsumsi API.
 */
async function apiFetch<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await _axios.get<T>(url, config);
  return response.data;
}

// Gabungkan axios instance dengan method fetch sebagai object tunggal
const api = Object.assign(_axios, { fetch: apiFetch });

export type ApiClient = typeof api;
export default api;
