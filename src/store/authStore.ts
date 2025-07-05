import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/lib/api';
import { UserRole } from '@/types/enums';

export interface UserAuthInfo {
  id: number;
  email: string;
  full_name: string | null;
  role: UserRole | null;
  status: string;
  company_id?: number | null;
  startup_id?: number | null;
  space_id?: number | null;
  space_corporate_admin_id?: number | null;
  current_workstation?: {
    workstation_id: number;
    workstation_name: string;
    assignment_start_date: string;
  } | null;
  profile?: {
      profile_picture_url?: string | null;
  };
}

interface AuthState {
  user: UserAuthInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: UserAuthInfo) => void;
  loginWithNewToken: (token: string) => Promise<void>;
  logout: () => void;
  setUser: (user: UserAuthInfo | null) => void;
  fetchUser: () => Promise<void>;
  refreshCurrentUser: () => Promise<UserAuthInfo | null>;
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
            const response = await api.get('/users/me');
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

      logout: () => {
        delete api.defaults.headers.common['Authorization'];
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
        set({ isLoading: true });
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/users/me');
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
          const response = await api.get('/users/me');
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