"use client";

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import UserDashboard from '@/components/dashboard/UserDashboard';

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);

  // The mock user is always available, so no need for loading state.
  // The authStore provides a default authenticated user.
  if (!user) {
    // This case should ideally not be reached if authStore is properly initialized.
    return <p>Please log in to see your dashboard.</p>;
  }

  // We will render the UserDashboard for all roles and let it handle role-specific UI.
  // Redirection logic is removed to focus on a single, unified dashboard experience.
  return <UserDashboard user={user} />;
};

export default DashboardPage;