import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token if available (e.g., from localStorage or Zustand store)
apiClient.interceptors.request.use((config) => {
  // const token = localStorage.getItem('access_token'); // Example: get token
  // For Zustand, you might need to access the store directly or have a utility
  // This part depends on how useAuthStore is implemented and if it can be accessed outside React components
  // If using useAuthStore from Zustand and it persists to localStorage, you could do:
  try {
    const authStateString = localStorage.getItem('auth-storage'); // Default name by Zustand persist middleware
    if (authStateString) {
      const authState = JSON.parse(authStateString);
      const token = authState?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {
    console.error('Error accessing token from localStorage for API client', e);
  }
  return config;
});

// You might want to add response interceptors for error handling too
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally if needed (e.g., redirect on 401, toast on 500)
    // For now, just re-throw to be handled by the caller
    return Promise.reject(error);
  }
); 