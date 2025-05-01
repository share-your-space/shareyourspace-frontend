import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from "@/components/ui/button";
import {
    Home, User, MessageSquare, Settings, LogOut, Users, Building, ShieldCheck, Loader2
} from "lucide-react";

interface AuthenticatedLayoutProps {
    children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const isLoadingAuth = useAuthStore((state) => state.isLoading);
    const logout = useAuthStore((state) => state.logout);

    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (!hasMounted || isLoadingAuth) {
            return;
        }

        if (!isAuthenticated) {
            if (pathname !== '/login') {
                router.push('/login');
            }
            return;
        }

        if (pathname.startsWith('/admin') && user?.role !== 'SYS_ADMIN') {
            console.warn('Redirecting non-admin user from admin route');
            router.push('/dashboard');
        }
    }, [isAuthenticated, isLoadingAuth, router, user, pathname, hasMounted]);

    const handleLogout = () => {
        logout();
    };

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/discover", label: "Discover", icon: Users },
        { href: "/connections", label: "Connections", icon: Users },
        { href: "/chat", label: "Chat", icon: MessageSquare },
        { href: "/profile", label: "Profile", icon: User },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    if (user?.role === 'SYS_ADMIN') {
        navItems.push({ href: "/admin", label: "Admin", icon: ShieldCheck });
    }

    if (!hasMounted || isLoadingAuth) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading session...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Redirecting to login...</p>
            </div>
        );
    }

    if (pathname.startsWith('/admin') && user?.role !== 'SYS_ADMIN') {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Access Denied. Redirecting...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background">
            <aside className="w-64 flex flex-col border-r border-border p-4 bg-card text-card-foreground">
                <div className="mb-6 text-2xl font-bold text-primary">ShareYourSpace</div>
                <nav className="flex-grow space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors ${
                                (pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/'))
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

            <main className="flex-1 overflow-y-auto p-6">
                {children}
            </main>
        </div>
    );
};

export default AuthenticatedLayout; 