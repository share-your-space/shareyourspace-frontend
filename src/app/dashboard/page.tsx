"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types/enums';
import { Loader2 } from 'lucide-react';
import UserDashboard from '@/components/dashboard/UserDashboard';

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === UserRole.SYS_ADMIN) {
        router.replace('/sys-admin');
      } else if (user.role === UserRole.CORP_ADMIN) {
        if (user.company?.id) {
            router.replace(`/company/${user.company.id}`);
        }
    }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role === UserRole.SYS_ADMIN || user.role === UserRole.CORP_ADMIN) {
    // Show a loader while checking auth state or during the redirection flicker
  return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4">Loading dashboard...</p>
                                  </div>
    );
  }

  // For all other roles (FREELANCER, STARTUP_ADMIN, etc.), render the standard user dashboard.
  return <UserDashboard user={user} />;
};

export default DashboardPage;