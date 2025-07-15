import { create } from 'zustand';
import { User } from '@/types/auth';
import { UserRole } from '@/types/enums';
import { mockCompanies } from '@/lib/mock-data';

// Mock user data for frontend-only development
const mockUser: User = {
  id: 'user-1',
  email: 'corpadmin@example.com',
  full_name: 'Corporate Admin',
  role: UserRole.CORP_ADMIN,
  status: 'ACTIVE',
  company_id: 'comp-1',
  company_name: 'Innovate Inc.',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  profile_picture_url: 'https://i.pravatar.cc/150?u=corpadmin@example.com',
  company: mockCompanies.find(c => c.id === 'comp-1' && c.type === 'Company') || null,
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  // Initialize with mocked authenticated state
  user: mockUser,
  token: 'mock-jwt-token',
  isAuthenticated: true,
  isLoading: false,

  login: (token, user) => {
    // In a real app, you'd set the token and user from the API response
    // Here, we can just log it for debugging, but the state is already authenticated
    console.log('Mock login called with:', { token, user });
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    // In a real app, this would clear the token and user data
    // For frontend-only, we can just reset to the initial mocked state
    // or simulate a logged-out state if needed for testing UI.
    console.log('Mock logout called');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setUser: (user) => set({ user }),
}));