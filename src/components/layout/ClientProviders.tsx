'use client';

import { ThemeProvider } from 'next-themes';
import { SocketConnectionManager } from '@/components/auth/SocketConnectionManager';
import { useAuthStore } from "@/store/authStore";
import AuthenticatedLayout from "./AuthenticatedLayout";
import UnauthenticatedLayout from "./UnauthenticatedLayout";

const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  const Layout = isAuthenticated ? AuthenticatedLayout : UnauthenticatedLayout;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SocketConnectionManager />
      <Layout>{children}</Layout>
    </ThemeProvider>
  )
};

export default ClientProviders; 