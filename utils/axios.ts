import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// Membuat instance dengan tipe AxiosInstance
const api: AxiosInstance = axios.create({
  baseURL: "/api/", // Point to our Next.js proxy
  withCredentials: true, // Biarkan browser mengirim cookie otomatis
  headers: {
    Accept: "application/json",
  },
});

// Interceptor request dihapus karena token sekarang dikelola oleh Middleware Next.js
// melalui HttpOnly Cookie. Browser akan mengirim cookie secara otomatis.
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;