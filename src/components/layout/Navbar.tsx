"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Bell, Loader2, MailQuestion, LogOut, User as UserIcon, Cog, Building, Users, Home, ExternalLink, MessageSquare
} from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api/base";
import { AxiosError } from 'axios';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserRole } from '@/types/enums';
import { UserSimpleInfo } from '@/types/user';

// Define Frontend Notification Type (matching backend schema)
interface Notification {
  id: number;
  user_id: number;
  type: string;
  related_entity_id: number | null;
  message: string;
  is_read: boolean;
  created_at: string;
  link?: string | null;
  reference?: string | null;
  sender?: UserSimpleInfo | null;
}

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
    const isLoading = useAuthStore((state) => state.isLoading);
    const logout = useAuthStore((state) => state.logout);
    const token = useAuthStore((state) => state.token);
    const refreshCurrentUser = useAuthStore((state) => state.refreshCurrentUser);

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const [errorNotifications, setErrorNotifications] = useState<string | null>(null);
    const [popoverOpen, setPopoverOpen] = useState(false);

    const getLinksForRole = (role: UserRole | undefined, companyId?: number | null) => {
        switch (role) {
            case UserRole.FREELANCER:
            case UserRole.STARTUP_ADMIN:
            case UserRole.STARTUP_MEMBER:
                return memberUserLinks;
            case UserRole.CORP_ADMIN:
                // Make sure companyId is available before constructing the link
                if (companyId) {
                    return [
                        { href: `/company/${companyId}`, label: "Corporate Dashboard", icon: Building },
                        { href: "/discover", label: "Discover", icon: Users },
                        { href: "/connections", label: "Connections", icon: ExternalLink },
                        { href: "/chat", label: "Chat", icon: MessageSquare },
                    ];
                }
                // Fallback or loading state link
                return [
                    { href: `/dashboard`, label: "Dashboard", icon: Building },
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

    const fetchNotifications = useCallback(async (isPopoverOpen = false) => {
        if (!token || !user) return;
        if (!isPopoverOpen) {
            setIsLoadingNotifications(true);
        }
        setErrorNotifications(null);
        try {
            const response = await apiClient.get<Notification[]>('/notifications/?limit=20&include_read=true');
            setNotifications(response.data);
        } catch (err: unknown) {
            const error = err as AxiosError<{ detail: string }>;
            setErrorNotifications(error.response?.data?.detail || (err as Error).message || 'Could not load notifications.');
        } finally {
            setIsLoadingNotifications(false);
        }
    }, [token, user]);

    useEffect(() => {
        if (isAuthenticated && token) {
            fetchNotifications();
        }
    }, [isAuthenticated, token, pathname, fetchNotifications]);

    useEffect(() => {
        const handlePopoverOpen = async () => {
            if (popoverOpen && isAuthenticated && token) {
                await fetchNotifications(true);
                const unreadWorkstationNotifications = notifications.some(
                    (n) =>
                        !n.is_read &&
                        (n.type === 'WORKSTATION_ASSIGNED' || n.type === 'WORKSTATION_UNASSIGNED')
                );

                if (unreadWorkstationNotifications) {
                    refreshCurrentUser();
                }
            }
        };
        handlePopoverOpen();
    }, [popoverOpen, isAuthenticated, token, notifications, fetchNotifications, refreshCurrentUser]);

    const handleNotificationClick = (notification: Notification) => {
        if (notification.link) {
            router.push(notification.link);
        }
        setPopoverOpen(false);
    };

    const handleMarkAllAsRead = async () => {
        try {
            await apiClient.put('/notifications/mark-all-as-read');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            toast.success("All notifications marked as read.");
        } catch {
            toast.error("Failed to mark all notifications as read.");
        }
    };

    const handleLogout = () => {
        logout(router);
        toast.success("Logged out successfully.");
    };

    const getInitials = (name: string | undefined | null) => {
        if (!name) return "?";
        const names = name.split(' ');
        return names.map((n) => n[0]).join('').toUpperCase();
    };

    const navLinks = getLinksForRole(user?.role as UserRole, user?.company?.id);
    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (isLoading) {
        return (
            <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="font-bold text-lg">
                            ShareYourSpace
                        </Link>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-8">
                    <Link href="/" className="font-bold text-lg hidden sm:block">
                        ShareYourSpace
                    </Link>
                    <div className="hidden md:flex items-center space-x-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    pathname === link.href ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {isAuthenticated && user ? (
                        <>
                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                        <Bell className="h-5 w-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-0" align="end">
                                    <div className="p-4 font-medium border-b flex justify-between items-center">
                                        Notifications
                                        {notifications.length > 0 && (
                                            <Button variant="link" size="sm" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
                                                Mark all as read
                                            </Button>
                                        )}
                                    </div>
                                    <ScrollArea className="h-96">
                                        <div className="p-2">
                                            {isLoadingNotifications ? (
                                                <div className="flex items-center justify-center p-8">
                                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                                </div>
                                            ) : errorNotifications ? (
                                                <div className="p-4 text-center text-sm text-destructive">
                                                    {errorNotifications}
                                                </div>
                                            ) : notifications.length === 0 ? (
                                                <div className="p-8 text-center text-sm text-muted-foreground">
                                                    You have no new notifications.
                                                </div>
                                            ) : (
                                                notifications.map((notification) => (
                                                    <NotificationItem
                                                        key={notification.id}
                                                        notification={notification}
                                                        onClick={() => handleNotificationClick(notification)}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    </ScrollArea>
                                </PopoverContent>
                            </Popover>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={user.profile?.profile_picture_signed_url || ''} alt={user.full_name || 'User'} />
                                            <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.full_name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                                        <UserIcon className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
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
                        <>
                            <Button variant="ghost" asChild>
                                <Link href="/login">Log in</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/signup">Sign up</Link>
                            </Button>
                        </>
                    )}
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
};

const NotificationItem: React.FC<{ notification: Notification, onClick: () => void }> = ({ notification, onClick }) => {
    const getIcon = () => {
        if (notification.type.includes('CONNECTION')) {
            return <Users className="h-5 w-5 text-blue-500" />;
        }
        if (notification.type.includes('MESSAGE')) {
            return <MessageSquare className="h-5 w-5 text-green-500" />;
        }
        if (notification.type.includes('INVITATION')) {
            return <MailQuestion className="h-5 w-5 text-purple-500" />;
        }
        return <Bell className="h-5 w-5 text-gray-500" />;
    };

    const getInitials = (name: string | undefined | null) => {
        if (!name) return "?";
        const names = name.split(' ');
        return names.map((n) => n[0]).join('').toUpperCase();
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-accent",
                !notification.is_read && "bg-blue-500/10 hover:bg-blue-500/20"
            )}
        >
            <div className="flex-shrink-0 mt-1">
                {notification.sender?.profile?.profile_picture_signed_url ? (
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={notification.sender.profile.profile_picture_signed_url} />
                        <AvatarFallback>{getInitials(notification.sender.full_name)}</AvatarFallback>
                    </Avatar>
                ) : (
                    getIcon()
                )}
            </div>
            <div className="flex-1">
                <p className="text-sm leading-snug">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.created_at).toLocaleString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </p>
            </div>
            {!notification.is_read && (
                <div className="w-2.5 h-2.5 bg-primary rounded-full self-center" />
            )}
        </div>
    );
};

export default Navbar;