"use client";

import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import AuthGuard from "@/components/layout/AuthGuard";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Check, Loader2, Trash2, MailQuestion, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

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
}

interface Connection {
  id: number;
  requester_id: number;
  recipient_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

const NotificationsPage = () => {
  const token = useAuthStore((state) => state.token);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllNotifications = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      // API endpoint might need adjustment for pagination in the future
      const response = await api.get<Notification[]>('/notifications/');
      setNotifications(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Could not load notifications.');
      toast.error(err.response?.data?.detail || err.message || 'Could not load notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNotifications();
  }, [token]);

  const handleMarkRead = async (notificationId: number) => {
    if (!token) return;
    try {
      await api.post(`/notifications/${notificationId}/read`);
      toast.success('Notification marked as read.');
      fetchAllNotifications(); // Refetch to ensure UI consistency
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to mark as read.');
    }
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      await api.post('/notifications/read-all');
      toast.success('All notifications marked as read.');
      fetchAllNotifications(); // Refetch to get the true state from backend
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to mark all as read.');
    }
  };
  
  // Simplified Accept/Decline for this page - may need more context or redirect to chat/connections page
  const handleAcceptConnection = async (connectionId: number | null, notificationId: number) => {
    if (!token || !connectionId) {
        toast.error("Cannot accept: Missing required info.");
        return;
    }
    try {
        await api.put<Connection>(`/connections/${connectionId}/accept`);
        toast.success("Connection accepted!");
        await handleMarkRead(notificationId); // Mark the original notification as read
        fetchAllNotifications(); // Refetch to update list
        useAuthStore.getState().triggerConnectionUpdate();
    } catch (err: any) {
        toast.error(err.response?.data?.detail || 'Accept failed.');
    }
  };

   const handleDeclineConnection = async (connectionId: number | null, notificationId: number) => {
    if (!token || !connectionId) {
        toast.error("Cannot decline: Missing required info.");
        return;
    }
    try {
         await api.put<Connection>(`/connections/${connectionId}/decline`);
         toast.info("Connection declined.");
         await handleMarkRead(notificationId); // Mark the original notification as read
         fetchAllNotifications(); // Refetch to update list
         useAuthStore.getState().triggerConnectionUpdate();
    } catch (err: any) {
        toast.error(err.response?.data?.detail || 'Decline failed.');
    }
  };


  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'connection_request':
        return <UserCheck className="w-5 h-5 text-blue-500 mr-3" />;
      case 'connection_accepted':
        return <Check className="w-5 h-5 text-green-500 mr-3" />;
      case 'new_chat_message':
        return <MailQuestion className="w-5 h-5 text-purple-500 mr-3" />;
      // Add more cases for other notification types
      default:
        return <Bell className="w-5 h-5 text-gray-500 mr-3" />;
    }
  };

  return (
    <AuthGuard>
      <AuthenticatedLayout>
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">All Notifications</h1>
            <Button onClick={handleMarkAllRead} variant="outline" disabled={isLoading || notifications.every(n => n.is_read)}>
              <Check className="mr-2 h-4 w-4" /> Mark all as read
            </Button>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading notifications...</p>
            </div>
          )}

          {error && (
            <Card className="bg-destructive/10 border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{error}</p>
                <Button onClick={fetchAllNotifications} variant="outline" className="mt-4">Try Again</Button>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && notifications.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>No Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">You don't have any notifications yet.</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && notifications.length > 0 && (
            <div className="space-y-4">
              {notifications.map((notification) => {
                const isConnectionRequest = notification.type === 'connection_request';
                // Assuming related_entity_id is the connection_id for connection requests
                const connectionIdForAction = isConnectionRequest ? notification.related_entity_id : null;

                return (
                  <Card 
                    key={notification.id} 
                    className={`transition-opacity ${notification.is_read ? 'opacity-70' : 'border-primary'}`}
                  >
                    <CardContent className="p-4 flex items-start justify-between">
                      <div className="flex items-start flex-grow">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-grow">
                          <p className={`font-medium ${!notification.is_read ? 'font-semibold' : ''}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                          {notification.link && notification.type !== 'connection_request' && (
                            <Link href={notification.link} className="text-xs text-blue-500 hover:underline mt-1 inline-block">
                              View Details
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2 ml-4 flex-shrink-0 w-40">
                        {!notification.is_read && (
                          <Button 
                            onClick={() => handleMarkRead(notification.id)} 
                            variant="outline" 
                            size="sm"
                            className="w-full"
                          >
                            <Check className="mr-2 h-4 w-4" /> Mark as read
                          </Button>
                        )}
                        {isConnectionRequest && !notification.is_read && connectionIdForAction && (
                          <>
                            <Button 
                              onClick={() => handleAcceptConnection(connectionIdForAction, notification.id)} 
                              variant="default" 
                              size="sm"
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                               <UserCheck className="mr-2 h-4 w-4" /> Accept
                            </Button>
                            <Button 
                              onClick={() => handleDeclineConnection(connectionIdForAction, notification.id)} 
                              variant="destructive" 
                              size="sm"
                              className="w-full"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Decline
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </AuthenticatedLayout>
    </AuthGuard>
  );
};

export default NotificationsPage; 