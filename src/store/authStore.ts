import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/lib/api';
import { User } from '@/types/auth';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  loginWithNewToken: (token: string) => Promise<void>;
  logout: (router?: AppRouterInstance) => void;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  refreshCurrentUser: () => Promise<User | null>;
  triggerConnectionUpdate: () => void;
}

// Helper function to check if we are on the client
const isClient = typeof window !== 'undefined';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      loginWithNewToken: async (token) => {
        set({ token, isLoading: true });
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
            const response = await api.get('/users/me/profile');
            set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
            console.error("Failed to fetch user after getting new token:", error);
            get().logout();
        }
      },

      login: (token, user) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: (router) => {
        delete api.defaults.headers.common['Authorization'];
        sessionStorage.removeItem('hasSeenProfilePopup');
        if (router) {
          router.push('/login');
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setUser: (user) => set({ user }),
      
      fetchUser: async () => {
        const token = get().token;
        if (!token) {
          set({ isLoading: false, isAuthenticated: false, user: null });
          return;
        }
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/users/me/profile');
          set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error("Session expired or invalid, logging out:", error);
          get().logout(); // Call logout from the store
        }
      },
      
      refreshCurrentUser: async () => {
        const token = get().token;
        if (!token) {
          set({ isLoading: false });
          return null;
        }
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/users/me/profile');
          const updatedUser = response.data;
          set({ user: updatedUser, isAuthenticated: true, isLoading: false });
          return updatedUser;
        } catch (error) {
          console.error("Failed to refresh current user:", error);
          set({ isLoading: false }); 
          return null;
        }
      },

      triggerConnectionUpdate: () => {
        // This function's purpose is to allow other components to trigger
        // a re-evaluation of effects that depend on the auth state.
        // By calling this, you can force components listening to this piece of state
        // to re-run their logic.
        set({ user: get().user });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist token and user. Other state should be transient.
      partialize: (state) => ({ token: state.token, user: state.user }),
      // This function runs after the store has been rehydrated
      onRehydrateStorage: () => (state) => {
        if (isClient && state) {
          console.log('Zustand hydration finished.');
          // If a token is present, assume authenticated and fetch user data
          // to ensure it's fresh and valid.
          if (state.token) {
            console.log('Token found on hydration, validating user session.');
            api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
            // We don't have access to `get()` here, so we use the hydrated `state`
            // and then call fetchUser which uses `get()` internally.
            useAuthStore.getState().fetchUser();
          } else {
            // If no token, ensure we are in a clean logged-out state.
            console.log('No token found on hydration, ensuring logged out state.');
            useAuthStore.setState({ isLoading: false, isAuthenticated: false, user: null });
          }
        }
      },
    }
  )
);

if (typeof window !== 'undefined') {
  useAuthStore.persist.onFinishHydration(() => {
    useAuthStore.setState({ isLoading: false });
  });
}