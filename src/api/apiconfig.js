import axios from "axios";
const token = localStorage.getItem("token");

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: token ? { Authorization: token } : {},
});

// Add an interceptor to dynamically update the token before each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Get the latest token
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;