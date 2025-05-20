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

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000/api/v1';

/**
 * Helper function for making authenticated API requests.
 * Automatically adds Authorization header if token exists.
 */
export async function fetchAuthenticated(path: string, options: RequestInit = {}): Promise<Response> {
  const token = useAuthStore.getState().token; // Get token directly from store state

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  // Add default content type if not provided for relevant methods
  // AND if the body is not FormData (which sets its own Content-Type)
  if (
    !headers.has('Content-Type') && 
    options.method && 
    ['POST', 'PUT', 'PATCH'].includes(options.method.toUpperCase()) &&
    !(options.body instanceof FormData) // Do not set Content-Type for FormData
  ) {
      headers.set('Content-Type', 'application/json');
  }

  const defaultOptions: RequestInit = {
      method: 'GET', // Default to GET
      ...options,
      headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, defaultOptions);

  if (!response.ok) {
    // Handle common errors or throw a custom error
    const errorData = await response.json().catch(() => ({ detail: 'Failed to parse error response' }));
    console.error('API Error:', response.status, errorData);
    throw new Error(errorData.detail || `HTTP error ${response.status}`);
  }

  return response;
}

// Example usage:
// const data = await fetchAuthenticated('/users/me').then(res => res.json());
// await fetchAuthenticated('/some/path', { method: 'POST', body: JSON.stringify({ key: 'value' }) });

// Assuming ChatMessageData type is defined elsewhere or we can define a basic one here
// For example:
// export interface ChatMessageData {
//   id: number;
//   sender_id: number;
//   conversation_id?: number;
//   content: string;
//   created_at: string; // or Date
//   updated_at?: string; // or Date
//   is_deleted?: boolean;
//   sender: { id: number; full_name: string; }; // Basic sender info
//   reactions: any[]; // Define more strictly if needed
// }

export async function editChatMessage(messageId: number, content: string): Promise<any> { // Replace 'any' with ChatMessageData if defined
  const response = await fetchAuthenticated(`/chat/messages/${messageId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });
  return response.json();
}

export async function deleteChatMessage(messageId: number): Promise<any> { // Replace 'any' with ChatMessageData if defined
  const response = await fetchAuthenticated(`/chat/messages/${messageId}`, {
    method: 'DELETE',
  });
  return response.json();
} 