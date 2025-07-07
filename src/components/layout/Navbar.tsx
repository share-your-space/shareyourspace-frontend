"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Bell, Check, X, Loader2, MailQuestion, LogOut, User as UserIcon, Cog, Briefcase, Building, Users, Home, ExternalLink, MessageSquare
} from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api/base";
import type { Connection } from '@/types/connection';
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
const explorerUserLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/discover", label: "Discover", icon: Users },
    { href: "/browse-spaces", label: "Browse Spaces", icon: Briefcase },
    { href: "/connections", label: "Connections", icon: ExternalLink },
    { href: "/chat", label: "Chat", icon: MessageSquare },
];

const memberUserLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/discover", label: "Discover", icon: Users },
    { href: "/connections", label: "Connections", icon: ExternalLink },
    { href: "/chat", label: "Chat", icon: MessageSquare },
];

const corpAdminLinks = [
    { href: "/corp-admin", label: "Corporate Dashboard", icon: Building },
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
    const triggerConnectionUpdate = useAuthStore((state) => state.triggerConnectionUpdate);

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const [errorNotifications, setErrorNotifications] = useState<string | null>(null);
    const [popoverOpen, setPopoverOpen] = useState(false);

    const fetchNotifications = useCallback(async (isPopoverOpen = false) => {
        if (!token || !user) return;
        if (!isPopoverOpen) {
            setIsLoadingNotifications(true);
        }
        setErrorNotifications(null);
        try {
            const response = await apiClient.get<Notification[]>('/notifications/?limit=20&include_read=true');
            setNotifications(response.data);
        } catch (err: any) {
            const error = err as AxiosError<{ detail: string }>;
            setErrorNotifications(error.response?.data?.detail || error.message || 'Could not load notifications.');
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

    const handleMarkRead = async (notificationId: number) => {
        if (!token) return;
        try {
            await apiClient.post(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );
            toast.success("Notification marked as read.");
            await fetchNotifications();
        } catch (err: any) {
            const error = err as AxiosError<{ detail: string }>;
            toast.error(error.response?.data?.detail || 'Failed to mark as read.');
        }
    };

    const handleAccept = async (connectionId: number | null, notificationId: number) => {
        if (!token || !connectionId) {
            toast.error("Cannot accept: Missing required info.");
            return;
        }
        try {
            await apiClient.put<Connection>(`/connections/${connectionId}/accept`);
            toast.success("Connection accepted!");
            await handleMarkRead(notificationId);
            await fetchNotifications();
            triggerConnectionUpdate();
        } catch (err: any) {
            const error = err as AxiosError<{ detail: string }>;
            toast.error(error.response?.data?.detail || 'Accept failed.');
        }
    };

    const handleDecline = async (connectionId: number | null, notificationId: number) => {
        if (!token || !connectionId) {
            toast.error("Cannot decline: Missing required info.");
            return;
        }
        try {
            await apiClient.put<Connection>(`/connections/${connectionId}/decline`);
            toast.info("Connection declined.");
            await handleMarkRead(notificationId);
            await fetchNotifications();
            triggerConnectionUpdate();
        } catch (err: any) {
            const error = err as AxiosError<{ detail: string }>;
            toast.error(err.response?.data?.detail || 'Decline failed.');
        }
    };

    const handleMarkAllRead = async () => {
        if (!token) return;
        try {
            await apiClient.post('/notifications/read-all');
            toast.success("All notifications marked as read.");
            await fetchNotifications();
        } catch (err: any) {
            const error = err as AxiosError<{ detail: string }>;
            toast.error(error.response?.data?.detail || 'Failed to mark all as read.');
        }
    };

    const handleLogout = () => {
        logout(router);
        toast.success("Logged out successfully.");
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const renderNotificationContent = (notification: Notification) => {
        const isExternal = notification.type === 'new_message' && user && notification.sender?.space_id !== user.space_id;
        const commonContent = (
            <>
                <span className="mt-1">
                    {notification.type === 'connection_request' ?
                        <Users className="w-4 h-4 text-blue-500" /> :
                        notification.type.startsWith('WORKSTATION') ?
                        <Briefcase className="w-4 h-4 text-purple-500" /> :
                        <MailQuestion className="w-4 h-4 text-muted-foreground" />
                    }
                </span>
                <div className="flex-grow">
                    <p className="text-xs leading-tight">{notification.message}
                        {isExternal && <span className="text-blue-500 font-semibold ml-1">(External)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(notification.created_at).toLocaleString()}</p>
                </div>
            </>
        );

        const contentWithPossibleLink = notification.link ? (
            <Link
                href={notification.link}
                className="flex items-start space-x-3 w-full hover:bg-accent/50 rounded-md p-2"
                onClick={() => {
                    if (notification.type !== 'connection_request') {
                        handleMarkRead(notification.id);
                    }
                    if (notification.type === 'WORKSTATION_ASSIGNED' || notification.type === 'WORKSTATION_UNASSIGNED') {
                        refreshCurrentUser();
                    }
                }}
            >
                {commonContent}
            </Link>
        ) : (
            <div className="flex items-start space-x-3 w-full p-2">
                {commonContent}
            </div>
        );

        if (notification.type === 'connection_request' && !notification.is_read) {
            return (
                <div className="p-2 hover:bg-accent/50 rounded-md">
                    <div className="flex items-start space-x-3 w-full">
                        {commonContent}
                    </div>
                    <div className="flex justify-end space-x-2 mt-2 pr-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDecline(notification.related_entity_id, notification.id)}
                        >
                            <X className="mr-1 h-3 w-3" /> Decline
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleAccept(notification.related_entity_id, notification.id)}
                        >
                            <Check className="mr-1 h-3 w-3" /> Accept
                        </Button>
                    </div>
                </div>
            );
        } else if (notification.type === 'connection_request' && notification.is_read) {
            return (
                <div className="p-2">
                    <div className="flex items-start space-x-3 w-full text-muted-foreground">
                        {commonContent}
                    </div>
                </div>
            );
        }

        return contentWithPossibleLink;
    };

    const getNavLinks = () => {
        switch (user?.role) {
            case UserRole.SYS_ADMIN:
                return sysAdminLinks;
            case UserRole.CORP_ADMIN:
                return corpAdminLinks;
            case UserRole.FREELANCER:
            case UserRole.STARTUP_ADMIN:
                return explorerUserLinks;
            case UserRole.STARTUP_MEMBER:
            case UserRole.CORP_EMPLOYEE:
                return memberUserLinks;
            default:
                return [];
        }
    };

    const navLinks = getNavLinks();

    return (
        <nav className="bg-background border-b sticky top-0 z-50">
            <div className="container mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-primary">
                    ShareYourSpace
                </Link>

                {isAuthenticated && (
                    <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
                        {navLinks.map((item) => (
                            <Button variant="ghost" asChild key={item.label}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        'text-sm font-medium transition-colors hover:text-primary',
                                        pathname.startsWith(item.href) ? 'text-primary' : 'text-muted-foreground'
                                    )}
                                >
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.label}
                                </Link>
                            </Button>
                        ))}
                    </div>
                )}

                <div className="flex items-center space-x-2 md:space-x-4">
                    <ThemeToggle />
                    {isAuthenticated && user && (
                        <>
                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                        <Bell className="h-5 w-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-0">
                                    <div className="p-4 border-b">
                                        <h4 className="font-medium">Notifications</h4>
                                        {notifications.length > 0 && unreadCount > 0 && (
                                            <Button variant="link" size="sm" className="text-xs text-blue-500 p-0 h-auto mt-1" onClick={handleMarkAllRead}>
                                                Mark all as read
                                            </Button>
                                        )}
                                    </div>
                                    {isLoadingNotifications ? (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />Loading...
                                        </div>
                                    ) : errorNotifications ? (
                                        <p className="p-4 text-center text-sm text-red-500">{errorNotifications}</p>
                                    ) : notifications.length > 0 ? (
                                        <ScrollArea className="h-[300px]">
                                            <div className="divide-y divide-border">
                                                {notifications.map((notification) => (
                                                    <div key={notification.id} className={cn("p-0", !notification.is_read && "bg-accent/30")}>
                                                        {renderNotificationContent(notification)}
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    ) : (
                                        <p className="p-4 text-center text-sm text-muted-foreground">No new notifications.</p>
                                    )}
                                    <div className="p-2 border-t text-center">
                                        <Link href="/notifications" passHref>
                                            <Button variant="link" size="sm" className="text-xs w-full" onClick={() => setPopoverOpen(false)}>
                                                View all notifications
                                            </Button>
                                        </Link>
                                    </div>
                                </PopoverContent>
                            </Popover>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.profile?.profile_picture_signed_url || undefined} alt={user.full_name || user.email} />
                                            <AvatarFallback>{user.full_name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}</AvatarFallback>
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
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/profile/edit"><UserIcon className="mr-2 h-4 w-4" />My Profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/settings"><Cog className="mr-2 h-4 w-4" />Settings</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                    {!isLoading && !isAuthenticated && (
                        <Button asChild><Link href="/login">Login</Link></Button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;