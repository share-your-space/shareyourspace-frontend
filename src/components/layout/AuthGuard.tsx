'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { UserRole } from '@/types/enums';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user, refreshCurrentUser } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isRefreshed, setIsRefreshed] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isRefreshed) {
      refreshCurrentUser().finally(() => {
        setIsRefreshed(true);
      });
    }
  }, [isAuthenticated, isRefreshed, refreshCurrentUser]);

  useEffect(() => {
    if (isLoading || !isRefreshed && isAuthenticated) {
      return; 
    }

    if (!isAuthenticated) {
      router.push('/login');
    } else if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role as UserRole)) {
      router.push('/dashboard'); // Or a dedicated 'unauthorized' page
    }
  }, [isAuthenticated, isLoading, router, pathname, user, allowedRoles, isRefreshed]);

  if (isLoading || (isAuthenticated && !isRefreshed)) {
    return <div>Loading...</div>; // Or a more sophisticated skeleton loader
  }

  if (isAuthenticated && user) {
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role as UserRole)) {
      return null; // Or render an unauthorized message/component
    }
    return <>{children}</>;
  }

  return null;
};

export default AuthGuard; 