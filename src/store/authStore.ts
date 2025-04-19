import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: null | { id: string; email: string; name: string; role: string }; // Adjust user type as needed
  token: null | string;
  setToken: (token: string | null) => void;
  setUser: (user: AuthState['user']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  setToken: (token) => {
    set({ token, isAuthenticated: !!token });
    // TODO: Persist token (e.g., localStorage, Secure HttpOnly Cookie handled by backend)
  },
  setUser: (user) => {
    set({ user });
  },
  logout: () => {
    set({ token: null, user: null, isAuthenticated: false });
    // TODO: Remove token from storage
  },
})); 