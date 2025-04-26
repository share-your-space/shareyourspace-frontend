import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from "@/components/ui/button";
import {
    Home, User, MessageSquare, Settings, LogOut, Users, Building, ShieldCheck
} from "lucide-react";
import Navbar from './Navbar';
import Footer from './Footer';

interface AuthenticatedLayoutProps {
    children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user, isLoading, logout } = useAuthStore((state) => state);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
            return; // Prevent further checks if redirecting
        }

        if (!isLoading && isAuthenticated && pathname.startsWith('/admin') && user?.role !== 'SYS_ADMIN') {
            console.warn('Redirecting non-admin user from admin route');
            router.push('/dashboard');
        }
    }, [isAuthenticated, isLoading, router, user, pathname]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/discover", label: "Discover", icon: Users },
        { href: "/chat", label: "Chat", icon: MessageSquare },
        { href: "/profile", label: "Profile", icon: User },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    // Conditionally add Admin link
    if (user?.role === 'SYS_ADMIN') {
        navItems.push({ href: "/admin", label: "Admin", icon: ShieldCheck });
    }

    if (isLoading || (!isAuthenticated && !pathname.startsWith('/login'))) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (isAuthenticated && pathname.startsWith('/admin') && user?.role !== 'SYS_ADMIN') {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 flex flex-col border-r border-border p-4 bg-card text-card-foreground">
                <div className="mb-6 text-2xl font-bold text-primary">ShareYourSpace</div>
                <nav className="flex-grow space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors ${
                                pathname.startsWith(item.href) && item.href !== '/dashboard' || (pathname === '/dashboard' && item.href === '/dashboard') || (pathname === '/admin' && item.href === '/admin')
                                ? 'bg-accent text-accent-foreground'
                                : 'text-muted-foreground'
                            }`}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="mt-auto">
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-6">
                {children}
            </main>
        </div>
    );
};

export default AuthenticatedLayout; 