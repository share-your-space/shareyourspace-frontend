"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation'; // Import useRouter and usePathname
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Bell, Check, X, Loader2, MailQuestion, LogOut, UserCheck, User as UserIcon, Settings, Home, Users, MessageSquare, ShieldCheck, ExternalLink, Briefcase
} from "lucide-react"
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"; // Import api client
import { type Connection } from '@/types/connection'; // Import Connection type
import {
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { UserSimpleInfo } from '@/types/user';

// Define Frontend Notification Type (matching backend schema)
interface Notification {
  id: number;
  user_id: number;
  type: string;
  related_entity_id: number | null;
  message: string;
  is_read: boolean;
  created_at: string; // Assuming ISO string format
  link?: string | null; // Added for navigation
  reference?: string | null; // Added for context
  sender?: UserSimpleInfo | null;
}

// --- Mock Auth Hook (Replace with actual logic later) ---
// Keeping this simple, directly reading from store is fine
// const useIsAuthenticated = () => {
//   const isAuthenticated = useAuthStore(state => state.isAuthenticated);
//   return isAuthenticated;
// }
// --- End Mock Auth Hook ---

const Navbar = () => {
  // const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const pathname = usePathname(); // Use the hook correctly
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore(state => state.token);
  const user = useAuthStore((state) => state.user);
  const isLoadingAuth = useAuthStore((state) => state.isLoading);
  const logout = useAuthStore(state => state.logout); // Get logout action from store

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [errorNotifications, setErrorNotifications] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const fetchNotifications = async (isPopoverOpen = false) => {
    if (!token || !user) return; // Do not fetch if user object isn't loaded yet
    if (!isPopoverOpen) { // Only show main loader when not opening popover
        setIsLoadingNotifications(true);
    }
    setErrorNotifications(null);
    try {
      const response = await api.get<Notification[]>('/notifications/?limit=20&include_read=true');
      setNotifications(response.data);
      
    } catch (err: any) { 
      setErrorNotifications(err.response?.data?.detail || err.message || 'Could not load notifications.');
      console.error("Fetch notifications error:", err);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Fetch notifications initially OR when pathname changes while authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      console.log("Navbar detected auth/pathname change, fetching notifications..."); // Debug log
      fetchNotifications();
    }
    // Depends on pathname to refetch on navigation
  }, [isAuthenticated, token, pathname]); // Add pathname here

  // Refetch notifications specifically when popover opens (for refresh)
  useEffect(() => {
    const handlePopoverOpen = async () => {
        if (popoverOpen && isAuthenticated && token) {
            console.log("Popover opened, fetching notifications..."); // Debug log
            await fetchNotifications(true); // Pass true to indicate it's a popover refresh

            // After fetching, check for relevant unread workstation notifications
            const unreadWorkstationNotifications = notifications.some(
                (n) => 
                    !n.is_read && 
                    (n.type === 'WORKSTATION_ASSIGNED' || n.type === 'WORKSTATION_UNASSIGNED')
            );

            if (unreadWorkstationNotifications) {
                console.log("Unread workstation notification found, refreshing current user...");
                useAuthStore.getState().refreshCurrentUser();
            }
        }
    };
    handlePopoverOpen();
    // Depends on popoverOpen to trigger only when it changes to true
  }, [popoverOpen, isAuthenticated, token]); // Keep notifications out of dep array to avoid loop with its own update

  // --- Action Handlers ---
  const handleMarkRead = async (notificationId: number) => {
    if (!token) return;
    // Reverted: Allow marking any notification type as read via this general handler.
    // The specific handling for member_request lifecycle is now on the backend 
    // and how the Corp Admin's "Member Requests" list is populated and actioned.
    try {
      await api.post(`/notifications/${notificationId}/read`);
      // Optimistically update UI, then refetch for consistency
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      toast.success("Notification marked as read.");
      fetchNotifications(); // Refetch to ensure consistency if needed, esp. for counts
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to mark as read.');
    }
  };

  const handleAccept = async (connectionId: number | null, notificationId: number) => {
    if (!token || !connectionId) {
        toast.error("Cannot accept: Missing required info.");
        return;
    }
    try {
        await api.put<Connection>(`/connections/${connectionId}/accept`);
        toast.success("Connection accepted!");
        await handleMarkRead(notificationId);
        fetchNotifications();
        useAuthStore.getState().triggerConnectionUpdate();
    } catch (err: any) {
        toast.error(err.response?.data?.detail || 'Accept failed.');
    }
  };

   const handleDecline = async (connectionId: number | null, notificationId: number) => {
    if (!token || !connectionId) {
        toast.error("Cannot decline: Missing required info.");
        return;
    }
    try {
         await api.put<Connection>(`/connections/${connectionId}/decline`);
         toast.info("Connection declined.");
         await handleMarkRead(notificationId);
         fetchNotifications();
         useAuthStore.getState().triggerConnectionUpdate();
    } catch (err: any) {
        toast.error(err.response?.data?.detail || 'Decline failed.');
    }
  };

  const handleMarkAllRead = async () => {
      if (!token) return;
      try {
          // Reverted: Call the /read-all endpoint directly.
          // Backend should handle marking all relevant (non-action-specific) notifications as read.
          await api.post('/notifications/read-all');
          toast.success("All notifications marked as read.");
          fetchNotifications(); // Refetch to get the true state from backend
      } catch (err: any) {
          toast.error(err.response?.data?.detail || 'Failed to mark all as read.');
      }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
    router.push('/');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Helper to render notification content, possibly as a link
  const renderNotificationContent = (notification: Notification) => {
    const isExternal = notification.type === 'new_message' && notification.sender?.space_id !== user?.space_id;

    const commonContent = (
      <>
        <span className="mt-1">
          {/* TODO: Consider different icons based on notification.type */} 
          {notification.type === 'connection_request' ? 
            <UserCheck className="w-4 h-4 text-blue-500"/> : 
          notification.type === 'WORKSTATION_ASSIGNED' || notification.type === 'WORKSTATION_UNASSIGNED' || notification.type === 'WORKSTATION_STATUS_UPDATED' || notification.type === 'WORKSTATION_DETAILS_CHANGED' ?
            <Briefcase className="w-4 h-4 text-purple-500" /> : // Icon for workstation notifications
          <MailQuestion className="w-4 h-4 text-muted-foreground"/>
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
          className="flex items-start space-x-3 w-full hover:bg-accent/50 rounded-md p-2" // Added padding and hover
          onClick={(e) => {
            // Allow navigation but also mark as read if not a connection action
            if (notification.type !== 'connection_request') {
                handleMarkRead(notification.id);
            }
            // Refresh user data if it's a workstation assignment/unassignment notification
            if (notification.type === 'WORKSTATION_ASSIGNED' || notification.type === 'WORKSTATION_UNASSIGNED') {
                useAuthStore.getState().refreshCurrentUser();
            }
            // setPopoverOpen(false); // Keep popover open if actions are inside
          }}
        >
        {commonContent}
        </Link>
    ) : (
      <div className="flex items-start space-x-3 w-full p-2">
        {commonContent}
      </div>
    );

    // Add Accept/Decline buttons for connection requests
    if (notification.type === 'connection_request' && !notification.is_read) { // Show actions only if unread
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
                    <Check className="mr-1 h-3 w-3"/> Accept
                </Button>
            </div>
        </div>
      );
    } else if (notification.type === 'connection_request' && notification.is_read) {
        // Optionally show a different state for already actioned connection requests
        return (
            <div className="p-2">
                <div className="flex items-start space-x-3 w-full text-muted-foreground">
                    {commonContent} 
                    {/* <span className="text-xs italic ml-auto">(Responded)</span> */} 
                </div>
            </div>
        );
    }

    return contentWithPossibleLink;
  };

  const mainNavLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/discover", label: "Discover", icon: Users },
    { href: "/browse-spaces", label: "Browse Spaces", icon: Briefcase },
    { href: "/connections", label: "Connections", icon: ExternalLink }, // Changed icon for variety
    { href: "/chat", label: "Chat", icon: MessageSquare },
  ];

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          ShareYourSpace
        </Link>

        {/* Main Navigation Links for Authenticated Users */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
                {mainNavLinks.map((item) => (
                    <Button variant="ghost" asChild key={item.label}>
                        <Link 
                            href={item.href}
                            className={`text-sm font-medium transition-colors hover:text-primary ${
                                pathname.startsWith(item.href) ? 'text-primary' : 'text-muted-foreground'
                            }`}
                        >
                           {/* <item.icon className="mr-2 h-4 w-4" /> */}{/* Icons can be too much for top nav */}
                            {item.label}
            </Link>
                    </Button>
                ))}
            </div>
        )}

        <div className="flex items-center space-x-2 md:space-x-4">
          <ThemeToggle />
          {isAuthenticated && (
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
                            <Loader2 className="h-4 w-4 animate-spin inline mr-2"/>Loading...
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
                        <AvatarImage src={user?.profile?.profile_picture_url || undefined} alt={user?.full_name || user?.email} />
                        <AvatarFallback>{user ? (user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()) : '...'}</AvatarFallback>
                    </Avatar>
               </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  {user && (
                    <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.full_name || user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard"><Home className="mr-2 h-4 w-4" />Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile"><UserIcon className="mr-2 h-4 w-4" />Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                     <Link href="/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link>
                  </DropdownMenuItem>
                  {user?.role === 'SYS_ADMIN' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin"><ShieldCheck className="mr-2 h-4 w-4" />Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          {!isLoadingAuth && !isAuthenticated && (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 

// --- Helper component for Notification Item ---
// ... existing code ...