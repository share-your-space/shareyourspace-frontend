'use client';

import React from 'react';
import { Toaster } from 'sonner';
import AuthGuard from './AuthGuard';

interface AuthenticatedLayoutProps {
    children: React.ReactNode;
}

/**
 * This layout component wraps pages that require authentication.
 * It uses the AuthGuard component to handle the logic of checking
 * authentication status and redirecting if necessary.
 * This component itself is only responsible for the visual layout
 * of authenticated pages (e.g., background, toast notifications).
 */
const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
    return (
        <AuthGuard>
            <main className="flex-1 w-full p-4 md:p-6 bg-background">
                <Toaster />
                {children}
            </main>
        </AuthGuard>
    );
};

export default AuthenticatedLayout;