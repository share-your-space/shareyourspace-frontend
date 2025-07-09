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
        get().refreshCurrentUser();
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

if (typeof window !== 'undefined') {
  useAuthStore.persist.onFinishHydration(() => {
    useAuthStore.setState({ isLoading: false });
  });
}