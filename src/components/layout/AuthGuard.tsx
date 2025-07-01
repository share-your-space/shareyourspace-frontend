'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return; // Wait until authentication state is loaded
    }

    // If auth state is loaded and user is not authenticated, redirect to login.
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Optional: Show a loading spinner while checking auth state
  if (isLoading) {
    return <div>Loading...</div>; // Replace with a proper loading component
  }

  // If user is authenticated, render the children.
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Return null or a loader while redirecting or if not authenticated.
  return null;
};

export default AuthGuard; 