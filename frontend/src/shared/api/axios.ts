import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Ekstensi tipe AxiosInstance untuk menambahkan method fetch
export interface CustomAxiosInstance extends AxiosInstance {
  fetch: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
}) as CustomAxiosInstance;

// Menambahkan custom fetch method untuk backward-compatibility 
// (akan me-return isi response.data secara langsung)
apiClient.fetch = async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.get<T>(url, config);
  return response.data;
};

export default apiClient;
