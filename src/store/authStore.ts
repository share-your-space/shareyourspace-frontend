import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  user: null | { id: string; email: string; name: string; role: string }; // Adjust user type as needed
  token: null | string;
  setToken: (token: string | null) => void;
  setUser: (user: AuthState['user']) => void;
  logout: () => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      setToken: (token) => {
        set({ token, isAuthenticated: !!token });
        // Persist middleware now handles saving to localStorage
      },
      setUser: (user) => {
        set({ user });
        // User info is also persisted automatically if needed
      },
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        // Persist middleware handles clearing from localStorage
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // use localStorage
      // Optionally, only persist specific parts of the state:
      // partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
); 