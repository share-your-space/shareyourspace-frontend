import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading); // Optional: check if auth state is still loading
  const router = useRouter();

  useEffect(() => {
    // Only run check after initial loading is complete (if applicable)
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Optional: Show a loading spinner while checking auth state
  if (isLoading) {
    return <div>Loading...</div>; // Replace with a proper loading component
  }

  // Render children only if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Return null or a loader while redirecting
  return null;
};

export default AuthGuard; 