"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation'; // Import useRouter and usePathname
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Bell, Check, X, Loader2, MailQuestion, LogOut } from "lucide-react" // Add LogOut icon
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"; // Import api client
import { type Connection } from '@/types/connection'; // Import Connection type

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      // Use api client
      const response = await api.get<Notification[]>('/notifications/?limit=10&include_read=true');
      setNotifications(response.data);
    } catch (err: any) { 
      setError(err.response?.data?.detail || err.message || 'Could not load notifications.');
      console.error("Fetch notifications error:", err);
    } finally {
      setIsLoading(false);
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
    if (popoverOpen && isAuthenticated && token) {
        console.log("Popover opened, fetching notifications..."); // Debug log
        fetchNotifications();
    }
    // Depends on popoverOpen to trigger only when it changes to true
  }, [popoverOpen, isAuthenticated, token]); // Keep this one separate

  // --- Action Handlers ---
  const handleMarkRead = async (notificationId: number) => {
    if (!token) return; // Should not happen if button is visible, but good practice
    try {
      // Use api client
      await api.post(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to mark as read.');
      console.error("Mark read error:", err);
    }
  };

  const handleAccept = async (connectionId: number | null, notificationId: number) => {
    if (!token || !connectionId) {
        toast.error("Cannot accept: Missing required info.");
        return;
    }
    try {
        // Use api client
        await api.put<Connection>(`/connections/${connectionId}/accept`);
        toast.success("Connection accepted!");
        await handleMarkRead(notificationId); // Mark as read after accepting
        fetchNotifications(); // Refetch for popover
        useAuthStore.getState().triggerConnectionUpdate(); // Trigger global update
    } catch (err: any) {
        toast.error(err.response?.data?.detail || 'Accept failed.');
        console.error("Accept connection error:", err);
    }
  };

   const handleDecline = async (connectionId: number | null, notificationId: number) => {
    if (!token || !connectionId) {
        toast.error("Cannot decline: Missing required info.");
        return;
    }
    try {
        // Use api client
         await api.put<Connection>(`/connections/${connectionId}/decline`);
         toast.info("Connection declined.");
         await handleMarkRead(notificationId); // Mark as read after declining
         fetchNotifications(); // Refetch for popover
         useAuthStore.getState().triggerConnectionUpdate(); // Trigger global update
    } catch (err: any) {
        toast.error(err.response?.data?.detail || 'Decline failed.');
        console.error("Decline connection error:", err);
    }
  };

  const handleMarkAllRead = async () => {
      if (!token) return;
      try {
          // Use api client
          await api.post('/notifications/read-all');
          toast.success("All notifications marked as read.");
          setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      } catch (err: any) {
          toast.error(err.response?.data?.detail || 'Failed to mark all as read.');
          console.error("Mark all read error:", err);
      }
  };

  const handleLogout = () => {
    logout(); // Call the logout action from the store
    toast.success("Logged out successfully.");
    router.push('/'); // Redirect to home/login page
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Helper to render notification content, possibly as a link
  const renderNotificationContent = (notification: Notification) => {
    const content = (
      <>
        <span className="mt-1">
          {/* TODO: Consider different icons based on notification.type */} 
          <MailQuestion className="w-4 h-4 text-muted-foreground"/>
        </span>
        <div className="flex-grow">
          <p className="text-xs leading-tight">{notification.message}</p>
          <p className="text-xs text-muted-foreground">{new Date(notification.created_at).toLocaleString()}</p>
        </div>
      </>
    );

    if (notification.link) {
      return (
        <Link 
            href={notification.link} 
            className="flex items-start space-x-3 w-full" 
            onClick={() => setPopoverOpen(false)} // Close popover on link click
        >
          {content}
        </Link>
      );
    }
    return content;
  };

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo/Brand Name */}
        <Link href="/" className="text-lg font-bold">
          ShareYourSpace
        </Link>

        {/* Navigation Links (Placeholder) - Hidden below md breakpoint */}
        <div className="hidden md:flex space-x-4 lg:space-x-6">
          <Link href="/#benefits" className="text-sm lg:text-base text-muted-foreground hover:text-foreground transition-colors">
            Benefits
          </Link>
          {/* Conditionally show Discover link? */}
          {isAuthenticated && (
            <Link href="/discover" className="text-sm lg:text-base text-muted-foreground hover:text-foreground transition-colors">
              Discover
            </Link>
          )}
          {isAuthenticated && (
              <Link href="/connections" className="text-sm lg:text-base text-muted-foreground hover:text-foreground transition-colors">
                Connections
              </Link>
          )}
          {isAuthenticated && (
              <Link href="/profile" className="text-sm lg:text-base text-muted-foreground hover:text-foreground transition-colors">
                My Profile
            </Link>
          )}
          {/* Add more links as needed */}
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center space-x-3 lg:space-x-4">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full"> {/* Add relative positioning */}
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                           {unreadCount}
                        </span>
                    )}
                     {/* <span className={cn("absolute top-1 right-1 block h-2 w-2 rounded-full bg-primary ring-background ring-offset-2", { hidden: unreadCount === 0 })} /> */}
                    <span className="sr-only">Notifications</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="flex justify-between items-center p-4 font-medium border-b">
                    <span>
                        Notifications
                        {unreadCount > 0 && (
                            <span className="text-xs text-muted-foreground ml-2">({unreadCount} unread)</span>
                        )}
                    </span>
                    <Button 
                        variant="link" 
                        size="sm" 
                        className="text-xs h-auto p-0" 
                        onClick={handleMarkAllRead}
                        disabled={unreadCount === 0}
                    >
                        Mark all read
                    </Button>
                    </div>
                  <ScrollArea className="h-72">
                    <div className="p-2 space-y-1"> {/* Reduced padding */} 
                      {isLoading && <div className="flex justify-center py-4"><Loader2 className="animate-spin h-5 w-5"/></div>}
                      {error && <p className="text-red-500 text-sm px-2 py-4 text-center">{error}</p>}
                      {!isLoading && !error && notifications.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No notifications yet.</p>
                      )}
                      {!isLoading && !error && notifications.map((n) => (
                        <div 
                            key={n.id} 
                            className={cn(
                                "p-2 rounded-lg hover:bg-muted/80", 
                                !n.is_read ? "bg-muted/50" : "",
                                n.link ? "cursor-pointer" : (!n.is_read ? "cursor-pointer" : "cursor-default") 
                            )}
                            // Mark as read if not a link and unread, or always if it's just a clickable div
                            onClick={() => { 
                                if (!n.is_read) handleMarkRead(n.id);
                                // If it's not a link itself, and we want to close popover on any click:
                                // if (!n.link) setPopoverOpen(false); 
                            }}
                        >
                           <div className="flex items-start space-x-3">
                                {renderNotificationContent(n)}
                           </div>
                           {/* Action buttons for connection requests */} 
                           {n.type === 'connection_request' && !n.is_read && (
                               <div className="flex gap-2 mt-2 pl-7"> {/* Indent actions */} 
                                   <Button size="sm" variant="default" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleAccept(n.related_entity_id, n.id); }}> 
                                       <Check className="h-3 w-3 mr-1"/> Accept
                                   </Button> 
                                   <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleDecline(n.related_entity_id, n.id); }}> 
                                       <X className="h-3 w-3 mr-1"/> Decline
                                   </Button> 
                               </div>
                           )} 
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              {/* Logout Button */}
               <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
               </Button>
            </>
          ) : (
            <Button onClick={() => router.push('/login')}>Login</Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 

// --- Helper component for Notification Item ---
// ... existing code ...