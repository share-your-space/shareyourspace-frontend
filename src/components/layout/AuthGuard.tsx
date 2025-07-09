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
  const { isAuthenticated, isLoading, user, fetchUser } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // On initial mount, always try to fetch the user.
    // The store's logic will handle whether a token exists.
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    // Don't do anything while the initial user fetch is in progress.
    if (isLoading) {
      return; 
    }

    // If not authenticated after checking, redirect to login.
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // If authenticated but the role is not allowed for the current route, redirect.
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role as UserRole)) {
      toast.error("You are not authorized to view this page.");
      router.push('/dashboard'); 
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router, pathname]);


  if (isLoading) {
    return <div>Loading...</div>; // Or a more sophisticated skeleton loader
  }

  // If we have roles and the user's role is not included, render nothing (or an unauthorized page)
  // This prevents brief flashes of content before the redirect effect runs.
  if (isAuthenticated && user && allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role as UserRole)) {
    return null; 
  }
  
  // If authenticated and authorized (or if no specific roles are required), show the children.
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // If not authenticated and not loading, return null to prevent rendering children.
  // The redirect effect will handle moving to the login page.
  return null;
};

export default AuthGuard; 