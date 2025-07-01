'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import AuthGuard from "@/components/layout/AuthGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription as AlertDesc } from "@/components/ui/alert";
import { Loader2, AlertTriangle, UserPlus, UserCheck, UserX, Inbox, Send, LinkIcon, Trash2, MessageSquare, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

// Types (should ideally be in @/types/connection.ts and imported)
interface UserReference {
    id: number;
    full_name: string | null;
    email?: string; // for display if needed
    profile_picture_signed_url?: string | null;
    title?: string | null;
}

interface ConnectionItem {
    id: number;
    requester_id: number;
    recipient_id: number;
    status: 'pending' | 'accepted' | 'declined' | 'blocked';
    created_at: string;
    updated_at: string;
    requester: UserReference; // Details of the user who sent the request
    recipient: UserReference; // Details of the user who received the request
}

const ConnectionCard: React.FC<{
    connection: ConnectionItem;
    perspective: 'incoming' | 'sent' | 'active';
    currentUserActualId: number | undefined;
    onAction: (action: 'accept' | 'decline' | 'cancel' | 'remove', connectionId: number) => void;
    isProcessingAction: Record<number, boolean>;
}> = ({ connection, perspective, currentUserActualId, onAction, isProcessingAction }) => {
    
    console.log('[ConnectionCard] Props:', { connection, perspective, currentUserActualId });

    const otherUser = perspective === 'incoming' ? connection.requester :
                      perspective === 'sent' ? connection.recipient :
                      connection.requester_id === currentUserActualId ? connection.recipient : connection.requester;

    console.log('[ConnectionCard] Determined otherUser:', otherUser);
    if (otherUser) {
        console.log('[ConnectionCard] otherUser.id:', otherUser.id);
    }

  const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

    return (
        <Card className="mb-4">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 border">
                        <AvatarImage src={otherUser?.profile_picture_signed_url || undefined} alt={otherUser?.full_name || 'User'} />
                        <AvatarFallback>{getInitials(otherUser?.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                        <p className="font-semibold text-sm">
                            <Link href={`/users/${otherUser?.id}`} className="hover:underline">
                                {otherUser?.full_name || `User ${otherUser?.id}`}
                    </Link>
                        </p>
                        <p className="text-xs text-muted-foreground">{otherUser?.title || 'No title specified'}</p>
                        <p className="text-xs text-muted-foreground">
                            {perspective === 'incoming' && `Wants to connect - Sent on ${new Date(connection.created_at).toLocaleDateString()}`}
                            {perspective === 'sent' && `Request sent on ${new Date(connection.created_at).toLocaleDateString()}`}
                            {perspective === 'active' && `Connected since ${new Date(connection.updated_at).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                    {perspective === 'incoming' && (
                        <>
                            <Button size="sm" variant="outline" onClick={() => onAction('decline', connection.id)} disabled={isProcessingAction[connection.id]}>
                                {isProcessingAction[connection.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="mr-1 h-4 w-4" />}Decline
                            </Button>
                            <Button size="sm" onClick={() => onAction('accept', connection.id)} disabled={isProcessingAction[connection.id]}>
                                {isProcessingAction[connection.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="mr-1 h-4 w-4" />}Accept
                            </Button>
                        </>
                    )}
                    {perspective === 'sent' && (
                        <Button size="sm" variant="destructive" onClick={() => onAction('cancel', connection.id)} disabled={isProcessingAction[connection.id]}>
                           {isProcessingAction[connection.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="mr-1 h-4 w-4" />}Cancel Request
                        </Button>
                )}
                    {perspective === 'active' && (
                        <>
                         <Button size="sm" variant="outline" asChild>
                            <Link href={`/chat?userId=${otherUser?.id}`}><MessageSquare className="mr-1 h-4 w-4"/>Chat</Link>
                         </Button>
                         <Button size="sm" variant="destructive" onClick={() => onAction('remove', connection.id)} disabled={isProcessingAction[connection.id]}>
                            {isProcessingAction[connection.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="mr-1 h-4 w-4" />}Remove
                         </Button>
                        </>
                 )}
                </div>
              </CardContent>
            </Card>
          );
}

const ConnectionsPage = () => {
    const [incoming, setIncoming] = useState<ConnectionItem[]>([]);
    const [sent, setSent] = useState<ConnectionItem[]>([]);
    const [active, setActive] = useState<ConnectionItem[]>([]);
    
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({ incoming: true, sent: true, active: true });
    const [error, setError] = useState<Record<string, string | null>>({ incoming: null, sent: null, active: null });
    const [isProcessingAction, setIsProcessingAction] = useState<Record<number, boolean>>({}); // Tracks loading state for specific connection actions by ID

    const currentUser = useAuthStore(state => state.user);
    const isLoadingAuth = useAuthStore((state) => state.isLoading); // Get auth loading state

    const fetchData = useCallback(async (type: 'incoming' | 'sent' | 'active') => {
        // Do not fetch if user is waitlisted or auth is still loading
        if (isLoadingAuth || currentUser?.status === 'WAITLISTED') {
            setIsLoading(prev => ({ ...prev, [type]: false })); // Ensure loading is set to false
            return;
        }

        setIsLoading(prev => ({ ...prev, [type]: true }));
        setError(prev => ({ ...prev, [type]: null }));
        let endpoint = '';
        switch (type) {
            case 'incoming': endpoint = '/connections/pending'; break; // Current user is recipient
            case 'sent': endpoint = '/connections/sent'; break; // Current user is requester, status pending
            case 'active': endpoint = '/connections/accepted'; break;
        }

        try {
            const response = await api.get<ConnectionItem[]>(endpoint);
            if (type === 'incoming') setIncoming(response.data);
            else if (type === 'sent') setSent(response.data);
            else if (type === 'active') setActive(response.data);
        } catch (err: any) {
            console.error(`Error fetching ${type} connections:`, err);
            setError(prev => ({ ...prev, [type]: err.response?.data?.detail || `Failed to fetch ${type} connections.` }));
        } finally {
            setIsLoading(prev => ({ ...prev, [type]: false }));
        }
    }, [currentUser, isLoadingAuth]);

    useEffect(() => {
        if (!isLoadingAuth && currentUser) { // Only fetch if auth loaded and user exists
            fetchData('incoming');
            fetchData('sent');
            fetchData('active');
        }
    }, [fetchData, currentUser, isLoadingAuth]);

    const handleAction = async (action: 'accept' | 'decline' | 'cancel' | 'remove', connectionId: number) => {
        if (currentUser?.status === 'WAITLISTED') return; // Safety check
        setIsProcessingAction(prev => ({ ...prev, [connectionId]: true }));
        let promise;
        let successMessage = '';

        try {
            switch (action) {
                case 'accept':
                    promise = api.put(`/connections/${connectionId}/accept`);
                    successMessage = 'Connection accepted!';
                    break;
                case 'decline':
                    promise = api.put(`/connections/${connectionId}/decline`);
                    successMessage = 'Connection declined.';
                    break;
                case 'cancel': // Assumes DELETE /connections/:id for cancelling by requester
                    promise = api.delete(`/connections/${connectionId}`);
                    successMessage = 'Connection request cancelled.';
                    break;
                case 'remove': // Assumes DELETE /connections/:id for removing by either party
                    promise = api.delete(`/connections/${connectionId}`);
                    successMessage = 'Connection removed.';
                    break;
                default:
                    throw new Error('Unknown action');
            }
            await promise;
            toast.success(successMessage);
            // Refresh all lists after action
            fetchData('incoming');
            fetchData('sent');
            fetchData('active');
            useAuthStore.getState().triggerConnectionUpdate(); // Notify other components like Navbar
        } catch (err: any) {
            console.error(`Error performing action ${action}:`, err);
            toast.error(err.response?.data?.detail || `Failed to ${action} connection.`);
        } finally {
            setIsProcessingAction(prev => ({ ...prev, [connectionId]: false }));
        }
    };

    const renderList = (type: 'incoming' | 'sent' | 'active', data: ConnectionItem[]) => {
        if (isLoading[type]) {
            return <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
        }
        if (error[type]) {
            return <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><CardTitle>Error</CardTitle><AlertDesc>{error[type]}</AlertDesc></Alert>;
        }
        if (data.length === 0) {
            let message = 'No connections here yet.';
            if (type === 'incoming') message = 'No incoming connection requests.';
            if (type === 'sent') message = 'You haven\'t sent any connection requests recently.';
            if (type === 'active') message = 'No active connections. Try discovering new people!';
            return <p className="text-center text-muted-foreground py-10">{message}</p>;
        }
        return (
            <div>
                {data.map(conn => (
                    <ConnectionCard 
                        key={conn.id} 
                        connection={conn} 
                        perspective={type}
                        currentUserActualId={currentUser?.id}
                        onAction={handleAction}
                        isProcessingAction={isProcessingAction}
                    />
                ))}
      </div>
    );
  };

  // Handle overall loading state based on auth status as well
  if (isLoadingAuth) {
    return (
        <AuthenticatedLayout>
            <div className="flex justify-center items-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
        </AuthenticatedLayout>
    );
  }

  // If user is waitlisted, show the specific message
  if (currentUser?.status === 'WAITLISTED') {
    return (
        <AuthenticatedLayout>
            <div className="container mx-auto py-8 px-4 md:px-6">
                <Alert variant="default" className="border-orange-500 mt-10">
                    <Lock className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-orange-700 mt-[-2px]">Feature Locked: Manage Connections</CardTitle>
                    <AlertDesc className="text-muted-foreground mt-2">
                        Managing connections, sending requests, and viewing your network will be available once you are actively assigned to a space.
                        This feature is integral to interacting with the community within your workspace.
                        <br />
                        In the meantime, ensure your <Link href="/profile" className="text-primary hover:underline">profile</Link> is up-to-date.
                    </AlertDesc>
                    <div className="mt-4">
                        <Button asChild variant="outline">
                            <Link href="/dashboard">Go to Dashboard</Link>
                        </Button>
                    </div>
                </Alert>
            </div>
        </AuthenticatedLayout>
    );
  }

  // Regular content for non-waitlisted users
  return (
        <AuthGuard>
    <AuthenticatedLayout>
      <div className="container mx-auto py-8 px-4 md:px-6">
                    <h1 className="text-3xl font-bold tracking-tight mb-8">Manage Connections</h1>
                    <Tabs defaultValue="incoming" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="incoming"><Inbox className="mr-2 h-4 w-4 sm:inline-block hidden"/>Incoming ({incoming.length})</TabsTrigger>
                            <TabsTrigger value="sent"><Send className="mr-2 h-4 w-4 sm:inline-block hidden"/>Sent ({sent.length})</TabsTrigger>
                            <TabsTrigger value="active"><LinkIcon className="mr-2 h-4 w-4 sm:inline-block hidden" />Active ({active.length})</TabsTrigger>
          </TabsList>
                        <TabsContent value="incoming">
                            {renderList('incoming', incoming)}
          </TabsContent>
                        <TabsContent value="sent">
                            {renderList('sent', sent)}
          </TabsContent>
                        <TabsContent value="active">
                            {renderList('active', active)}
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
        </AuthGuard>
  );
};

export default ConnectionsPage; 