import axios from 'axios';
import { useAuthStore } from '@/store/authStore'; // Adjust path if needed

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add JWT token to requests
api.interceptors.request.use(
    (config) => {
        // Get token from Zustand store *outside* of React component context
        // This requires the store listener setup or getting state directly
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optional: Add response interceptor for handling 401 errors (e.g., auto-logout)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access - e.g., logout user
            console.error("Unauthorized access - logging out.");
            useAuthStore.getState().logout();
            // Optionally redirect to login page
            // window.location.href = '/login'; // Avoid if possible in SSR/Next.js
        }
        return Promise.reject(error);
    }
);

export { api }; 