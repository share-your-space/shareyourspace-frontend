'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { useAuthStore } from '@/store/authStore';
import { api } from "@/lib/api";
import { type Connection } from '@/types/connection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X, User, AlertTriangle, Info, Users, CheckCircle, Send, AlertCircle, MailQuestion } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { toast } from 'sonner';
import Link from 'next/link';

// Enum for API endpoints
enum ConnectionListType {
  PENDING_INCOMING = '/connections/pending',
  PENDING_OUTGOING = '/connections/pending/outgoing',
  ACCEPTED = '/connections/accepted',
  DECLINED = '/connections/declined',
  // BLOCKED = '/connections/blocked', // Add later
}

type LoadingStates = {
  [key in ConnectionListType]?: boolean;
};

type ErrorStates = {
  [key in ConnectionListType]?: string | null;
};

export default function ConnectionsPage() {
  const token = useAuthStore((state) => state.token);
  const currentUserId = useAuthStore((state) => state.user?.id);
  // Subscribe to the update counter
  const connectionUpdateCounter = useAuthStore((state) => state.connectionUpdateCounter);

  const [connections, setConnections] = useState<Record<string, Connection[]>>({
    [ConnectionListType.PENDING_INCOMING]: [],
    [ConnectionListType.PENDING_OUTGOING]: [],
    [ConnectionListType.ACCEPTED]: [],
    [ConnectionListType.DECLINED]: [],
  });
  const [loading, setLoading] = useState<LoadingStates>({});
  const [errors, setErrors] = useState<ErrorStates>({});
  const [activeTab, setActiveTab] = useState<string>("pending"); // Default tab

  const fetchData = useCallback(async (listType: ConnectionListType) => {
    if (!token) return;

    setLoading(prev => ({ ...prev, [listType]: true }));
    setErrors(prev => ({ ...prev, [listType]: null }));

    try {
      console.log(`Fetching connections for: ${listType}`); // Debug log
      const response = await api.get<Connection[]>(listType);
      setConnections(prev => ({
        ...prev,
        [listType]: response.data,
      }));
    } catch (err: any) {
      console.error(`Fetch ${listType} error:`, err);
      const errorMsg = err.response?.data?.detail || err.message || 'An unknown error occurred.';
      setErrors(prev => ({ ...prev, [listType]: errorMsg }));
    } finally {
      setLoading(prev => ({ ...prev, [listType]: false }));
    }
  }, [token]);

  // Fetch initial data (runs once on mount if token exists)
  useEffect(() => {
    console.log("ConnectionsPage mounted, initial fetch..."); // Debug log
    fetchData(ConnectionListType.PENDING_INCOMING);
    fetchData(ConnectionListType.PENDING_OUTGOING);
    fetchData(ConnectionListType.ACCEPTED);
    fetchData(ConnectionListType.DECLINED);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]); // Keep fetchData dependency, but it should be stable

  // Refetch data when the global trigger changes (and it's not the initial mount)
  useEffect(() => {
    // Avoid refetching immediately on mount due to initial counter value
    if (connectionUpdateCounter > 0) { 
      console.log("Connection update triggered, refetching all lists..."); // Debug log
      fetchData(ConnectionListType.PENDING_INCOMING);
      fetchData(ConnectionListType.PENDING_OUTGOING);
      fetchData(ConnectionListType.ACCEPTED);
      fetchData(ConnectionListType.DECLINED);
    }
  }, [connectionUpdateCounter, fetchData]); // Depend on counter and fetchData

  const handleAccept = async (connectionId: number) => {
    try {
      await api.put<Connection>(`/connections/${connectionId}/accept`);
      toast.success("Connection accepted!");
      // Refetch relevant lists
      fetchData(ConnectionListType.PENDING_INCOMING);
      fetchData(ConnectionListType.ACCEPTED);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Accept failed.');
    }
  };

  const handleDecline = async (connectionId: number) => {
    try {
      await api.put<Connection>(`/connections/${connectionId}/decline`);
      toast.info("Connection declined.");
      // Refetch relevant lists
      fetchData(ConnectionListType.PENDING_INCOMING);
      fetchData(ConnectionListType.DECLINED);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Decline failed.');
    }
  };

  const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const renderConnectionList = (listType: ConnectionListType, emptyMessage: string, showActions: boolean = false) => {
    const list = connections[listType] || [];
    const isLoading = loading[listType];
    const error = errors[listType];

    if (isLoading) {
      return <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground"/></div>;
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading List</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (list.length === 0) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          <Info className="mx-auto h-8 w-8 mb-2" />
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 mt-4">
        {list.map((conn) => {
          // Determine the other user involved in the connection
          const otherUser = conn.requester?.id === currentUserId ? conn.recipient : conn.requester;
          if (!otherUser) {
             console.warn("Could not determine other user for connection:", conn);
             return null; // Should not happen if data includes users
          }
          
          return (
            <Card key={conn.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={otherUser.profile?.profile_picture_signed_url || undefined} alt={otherUser.full_name || 'User'} />
                    <AvatarFallback>{getInitials(otherUser.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/users/${otherUser.id}`} className="font-medium hover:underline">
                       {otherUser.full_name || `User ${otherUser.id}`}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {otherUser.profile?.title || 'No title specified'}
                    </p>
                  </div>
                </div>
                {showActions && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAccept(conn.id)}><Check className="h-4 w-4 mr-1"/> Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => handleDecline(conn.id)}><X className="h-4 w-4 mr-1"/> Decline</Button>
                  </div>
                )}
                {listType === ConnectionListType.PENDING_OUTGOING && (
                     <Badge variant="outline">Pending</Badge>
                )}
                {listType === ConnectionListType.DECLINED && (
                     <Badge variant="destructive">Declined</Badge>
                )}
                 {listType === ConnectionListType.ACCEPTED && (
                     <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1 text-green-600"/> Connected</Badge>
                 )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Manage Connections</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4"> {/* Adjust grid-cols based on tabs */}
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="declined">Declined</TabsTrigger>
            {/* <TabsTrigger value="blocked">Blocked</TabsTrigger> */}
          </TabsList>

          {/* Pending Tab Content (includes Incoming & Outgoing) */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><MailQuestion className="mr-2 h-5 w-5" /> Incoming Requests</CardTitle>
                <CardDescription>Requests waiting for your response.</CardDescription>
              </CardHeader>
              <CardContent>
                 {renderConnectionList(ConnectionListType.PENDING_INCOMING, "No incoming connection requests.", true)}
              </CardContent>
            </Card>
             <Card className="mt-6">
              <CardHeader>
                 <CardTitle className="flex items-center"><Send className="mr-2 h-5 w-5" /> Sent Requests</CardTitle>
                <CardDescription>Requests you have sent that are awaiting a response.</CardDescription>
              </CardHeader>
              <CardContent>
                 {renderConnectionList(ConnectionListType.PENDING_OUTGOING, "You haven't sent any connection requests yet.")}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accepted">
            <Card>
               <CardHeader>
                 <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5" /> Accepted Connections</CardTitle>
                <CardDescription>Users you are currently connected with.</CardDescription>
              </CardHeader>
              <CardContent>
                  {renderConnectionList(ConnectionListType.ACCEPTED, "You haven't connected with anyone yet.")}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="declined">
            <Card>
               <CardHeader>
                 <CardTitle className="flex items-center"><AlertCircle className="mr-2 h-5 w-5" /> Declined Connections</CardTitle>
                <CardDescription>Connection requests that were declined (either by you or the other person).</CardDescription>
              </CardHeader>
              <CardContent>
                 {renderConnectionList(ConnectionListType.DECLINED, "No declined connections.")}
              </CardContent>
            </Card>
          </TabsContent>

          {/* <TabsContent value="blocked">
             Blocked List - Implement Later
          </TabsContent> */}
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
} 