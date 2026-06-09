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

// Add a response interceptor to handle global errors like 413 Request Entity Too Large
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 413) {
      // Create a user-friendly message for 413 errors (often from nginx)
      const friendlyMessage = "File too large. Please upload a smaller file.";
      
      // Update the error object so components can use the friendly message
      error.message = friendlyMessage;
      
      // If the response is HTML (typical for nginx errors), replace it with a JSON object
      if (error.response.data && typeof error.response.data === 'string' && error.response.data.includes('<html')) {
        error.response.data = { status: false, message: friendlyMessage };
      }
    }
    return Promise.reject(error);
  }
);

export default api;