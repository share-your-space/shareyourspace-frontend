'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { SocketConnectionManager } from '@/components/auth/SocketConnectionManager';

/**
 * Wrapper component for client-side providers like ThemeProvider
 * and components requiring client hooks like SocketConnectionManager.
 */
export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SocketConnectionManager /> {/* Socket manager needs to be inside providers that might influence it, but here is fine */}
      {children} {/* Render the rest of the app */}
    </ThemeProvider>
  );
} 