import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserInfo {
    id: string; // Assuming ID might be string from backend
    email: string;
    full_name: string; // Match backend schema
    role: string; // SYS_ADMIN, CORP_ADMIN etc.
    // Add other fields fetched from /users/me if needed
}

interface AuthState {
  isAuthenticated: boolean;
  user: null | UserInfo; // Use defined UserInfo type
  token: null | string;
  isLoading: boolean; // Added for hydration check
  connectionUpdateCounter: number; // NEW: Counter to trigger updates
  setToken: (token: string | null) => void;
  setUser: (user: AuthState['user']) => void;
  logout: () => void;
  triggerConnectionUpdate: () => void; // NEW: Action to increment counter
}

export const useAuthStore = create(
  persist<AuthState>(
    (set, get) => ({ // Add get to access current state
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: true, // Start as loading until hydration completes
      connectionUpdateCounter: 0, // Initialize counter
      setToken: (token) => {
        set({ token, isAuthenticated: !!token });
      },
      setUser: (user) => {
        set({ user });
      },
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },
      triggerConnectionUpdate: () => { // Implement the action
        set(state => ({ connectionUpdateCounter: state.connectionUpdateCounter + 1 }));
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // use localStorage
      onRehydrateStorage: () => (state) => { // Set isLoading to false after hydration
        if (state) {
            state.isLoading = false;
        }
      },
      // Optionally, only persist specific parts of the state:
      // partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
); 