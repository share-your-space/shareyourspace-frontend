'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, refreshCurrentUser } = useAuthStore();
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
    }
  }, [isAuthenticated, isLoading, router, pathname, isRefreshed]);

  if (isLoading || (isAuthenticated && !isRefreshed)) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return null;
};

export default AuthGuard; 