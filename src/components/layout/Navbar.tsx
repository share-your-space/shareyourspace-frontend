"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Bell, LogOut, User as UserIcon, Cog, Building, Users, Home, ExternalLink, MessageSquare, MailCheck
} from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserRole } from '@/types/enums';

// Mock Notification Type
interface Notification {
  id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  link?: string;
}

// Mock Notifications Data
const mockNotifications: Notification[] = [
  { id: 1, type: 'NEW_MESSAGE', message: 'You have a new message from Jane Doe.', is_read: false, created_at: '2025-07-13T10:00:00Z', link: '/chat' },
  { id: 2, type: 'CONNECTION_ACCEPTED', message: 'John Smith accepted your connection request.', is_read: false, created_at: '2025-07-13T09:30:00Z', link: '/connections' },
  { id: 3, type: 'SPACE_UPDATE', message: 'Creative Hub has updated their amenities.', is_read: true, created_at: '2025-07-12T15:00:00Z', link: '/browse-spaces' },
  { id: 4, type: 'BOOKING_CONFIRMED', message: 'Your workstation booking for tomorrow is confirmed.', is_read: true, created_at: '2025-07-12T11:00:00Z', link: '/dashboard' },
];

// Define navigation links for different roles
const memberUserLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/discover", label: "Discover", icon: Users },
    { href: "/connections", label: "Connections", icon: ExternalLink },
    { href: "/chat", label: "Chat", icon: MessageSquare },
];

const sysAdminLinks = [
    { href: "/sys-admin", label: "System Administration", icon: Cog },
];

const Navbar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const logout = useAuthStore((state) => state.logout);

    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [popoverOpen, setPopoverOpen] = useState(false);

    const getLinksForRole = (role: UserRole | undefined, companyId?: number | null) => {
        switch (role) {
            case UserRole.FREELANCER:
            case UserRole.STARTUP_ADMIN:
            case UserRole.STARTUP_MEMBER:
                return memberUserLinks;
            case UserRole.CORP_ADMIN:
                const companyBaseUrl = companyId ? `/company/${companyId}` : '/dashboard';
                return [
                    { href: `${companyBaseUrl}/overview`, label: "Corporate Dashboard", icon: Building },
                    { href: "/discover", label: "Discover", icon: Users },
                    { href: "/connections", label: "Connections", icon: ExternalLink },
                    { href: "/chat", label: "Chat", icon: MessageSquare },
                ];
            case UserRole.SYS_ADMIN:
                return sysAdminLinks;
            default:
                return [];
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (notification.link) {
            router.push(notification.link);
        }
        setPopoverOpen(false);
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        toast.success("All notifications marked as read.");
    };

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully.");
        router.push('/login');
    };

    const getInitials = (name: string | undefined | null) => {
        if (!name) return "?";
        const names = name.split(' ');
        return names.map((n) => n[0]).join('').toUpperCase();
    };

    const navLinks = getLinksForRole(user?.role, user?.company?.id);
    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-8">
                    <Link href="/" className="font-bold text-lg hidden sm:block">
                        ShareYourSpace
                    </Link>
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated && navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    pathname.startsWith(link.href) ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <ThemeToggle />
                    {isAuthenticated && user ? (
                        <>
                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                        <Bell className="h-5 w-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-0">
                                    <div className="p-4 border-b">
                                        <h4 className="font-medium">Notifications</h4>
                                    </div>
                                    <ScrollArea className="h-96">
                                        {notifications.length > 0 ? (
                                            notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => handleNotificationClick(n)}
                                                    className={cn(
                                                        "p-4 border-b hover:bg-muted cursor-pointer",
                                                        !n.is_read && "bg-primary/5"
                                                    )}
                                                >
                                                    <p className="text-sm font-medium">{n.message}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {new Date(n.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="p-4 text-center text-sm text-muted-foreground">No new notifications.</p>
                                        )}
                                    </ScrollArea>
                                    {notifications.length > 0 && (
                                        <div className="p-2 border-t">
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-center text-sm"
                                                onClick={handleMarkAllAsRead}
                                                disabled={unreadCount === 0}
                                            >
                                                <MailCheck className="mr-2 h-4 w-4" /> Mark all as read
                                            </Button>
                                        </div>
                                    )}
                                </PopoverContent>
                            </Popover>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.profile_picture_url || ''} alt={user.full_name || 'User'} />
                                            <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.full_name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => user.id && router.push(`/users/${user.id}`)}>
                                        <UserIcon className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                                        <Home className="mr-2 h-4 w-4" />
                                        <span>Dashboard</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                                        <Cog className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="space-x-2">
                            <Button variant="ghost" onClick={() => router.push('/login')}>Log in</Button>
                            <Button onClick={() => router.push('/signup')}>Sign up</Button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;