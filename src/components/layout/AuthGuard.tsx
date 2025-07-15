'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { UserRole } from '@/types/enums';
import { toast } from 'sonner';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't do anything while the initial state is loading.
    if (isLoading) {
      return;
    }

    // If not authenticated, redirect to login.
    // Public pages like /login should not be guarded.
    // We can check if allowedRoles is undefined or empty for public pages.
    if (!isAuthenticated && pathname !== '/login' && !pathname.startsWith('/accept-invitation')) {
      router.push('/login');
      return;
    }

    // If authenticated but the role is not allowed for the current route, redirect.
    if (
      isAuthenticated &&
      user &&
      allowedRoles &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user.role as UserRole)
    ) {
      toast.error('You are not authorized to view this page.');
      router.push('/dashboard'); // or a more generic start page
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router, pathname]);

  // While loading, show a loader.
  if (isLoading) {
    return <div>Loading...</div>; // Or a more sophisticated skeleton loader
  }

  // If authenticated and authorized, show the children.
  if (isAuthenticated && user) {
    if (
      allowedRoles &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user.role as UserRole)
    ) {
      // This prevents a flash of content before redirect.
      return null;
    }
    return <>{children}</>;
  }

  // For public pages (like login), show children if not authenticated.
  if (!isAuthenticated && (pathname === '/login' || pathname.startsWith('/accept-invitation'))) {
    return <>{children}</>;
  }

  // Otherwise, don't render anything while redirecting.
  return null;
};

export default AuthGuard;