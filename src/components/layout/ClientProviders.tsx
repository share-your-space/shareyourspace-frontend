'use client';

import { ThemeProvider } from 'next-themes';
import { SocketConnectionManager } from '@/components/auth/SocketConnectionManager';
import { useAuthStore } from "@/store/authStore";
import AuthenticatedLayout from "./AuthenticatedLayout";
import UnauthenticatedLayout from "./UnauthenticatedLayout";
import { useEffect } from "react";

const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  const fetchUser = useAuthStore(state => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SocketConnectionManager />
      {children}
    </ThemeProvider>
  )
};

export default ClientProviders; 