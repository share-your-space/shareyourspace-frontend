'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription as AlertDesc, AlertTitle } from "@/components/ui/alert";
import { Loader2, UserCheck, UserX, Inbox, Send, UserPlus, Trash2, MessageSquare, Users, MailQuestion } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { AxiosError } from 'axios';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

// Types
interface UserReference {
    id: number;
    full_name: string | null;
    email?: string;
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
    requester: UserReference;
    recipient: UserReference;
}

const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

const ConnectionActionCard: React.FC<{
    connection: ConnectionItem;
    perspective: 'incoming' | 'sent';
    onAction: (action: 'accept' | 'decline' | 'cancel', connectionId: number) => void;
    isProcessingAction: Record<number, boolean>;
}> = ({ connection, perspective, onAction, isProcessingAction }) => {
    
    const otherUser = perspective === 'incoming' ? connection.requester : connection.recipient;

    return (
        <Card className="p-4 transition-shadow hover:shadow-md mb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                    <Link href={`/users/${otherUser?.id}`}>
                        <Avatar className="h-16 w-16 border-2 border-transparent hover:border-primary transition-colors">
                            <AvatarImage src={otherUser?.profile_picture_signed_url || undefined} alt={otherUser?.full_name || 'User'} />
                            <AvatarFallback>{getInitials(otherUser?.full_name)}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div>
                        <Link href={`/users/${otherUser?.id}`} className="hover:underline">
                            <p className="font-bold text-lg">{otherUser?.full_name || `User ${otherUser?.id}`}</p>
                        </Link>
                        <p className="text-sm text-muted-foreground">{otherUser?.title || 'No title specified'}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {perspective === 'incoming' ? `Wants to connect` : `Request sent`}
                            {` on ${new Date(connection.created_at).toLocaleDateString()}`}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 self-end sm:self-center">
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
                           {isProcessingAction[connection.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="mr-1 h-4 w-4" />}Cancel
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}

const UserConnectionCard: React.FC<{
    connection: ConnectionItem;
    currentUserActualId: number | undefined;
    onAction: (action: 'remove', connectionId: number) => void;
    isProcessingAction: Record<number, boolean>;
}> = ({ connection, currentUserActualId, onAction, isProcessingAction }) => {
    const otherUser = connection.requester_id === currentUserActualId ? connection.recipient : connection.requester;

    return (
        <Card className="overflow-hidden text-center transition-shadow hover:shadow-xl">
            <Link href={`/users/${otherUser.id}`} className="block hover:bg-gray-50/50">
                <div className="pt-6">
                    <Avatar className="h-24 w-24 mx-auto border-4 border-white shadow-md">
                        <AvatarImage src={otherUser.profile_picture_signed_url || undefined} alt={otherUser.full_name || 'User'} />
                        <AvatarFallback>{getInitials(otherUser.full_name)}</AvatarFallback>
                    </Avatar>
                </div>
                <CardContent className="p-4">
                    <h3 className="font-semibold text-lg truncate" title={otherUser.full_name || ''}>{otherUser.full_name}</h3>
                    <p className="text-sm text-muted-foreground truncate" title={otherUser.title || ''}>{otherUser.title || 'No title'}</p>
                </CardContent>
            </Link>
            <div className="px-4 pb-4 border-t pt-4 flex justify-center gap-2">
                <Button asChild size="sm" className="flex-1">
                    <Link href={`/chat?userId=${otherUser.id}`}><MessageSquare className="mr-2 h-4 w-4"/>Chat</Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onAction('remove', connection.id)} disabled={isProcessingAction[connection.id]} className="flex-1">
                    {isProcessingAction[connection.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserX className="mr-2 h-4 w-4" />Remove</>}
                </Button>
            </div>
        </Card>
    );
};

const EmptyState: React.FC<{
    icon: React.ElementType;
    title: string;
    description: string;
    action?: {
        href: string;
        label: string;
    }
}> = ({ icon: Icon, title, description, action }) => (
    <Card className="w-full py-12 px-6 flex flex-col items-center text-center border-2 border-dashed">
        <div className="bg-secondary p-4 rounded-full mb-4">
            <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
        {action && (
            <Button asChild>
                <Link href={action.href}>
                    <UserPlus className="mr-2 h-4 w-4" /> {action.label}
                </Link>
            </Button>
        )}
    </Card>
);


const ConnectionsPage = () => {
    const [incoming, setIncoming] = useState<ConnectionItem[]>([]);
    const [sent, setSent] = useState<ConnectionItem[]>([]);
    const [active, setActive] = useState<ConnectionItem[]>([]);
    
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isProcessingAction, setIsProcessingAction] = useState<Record<number, boolean>>({});
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    const currentUser = useAuthStore(state => state.user);
    const isLoadingAuth = useAuthStore((state) => state.isLoading);

    useEffect(() => {
        const fetchData = async () => {
            if (isLoadingAuth || !currentUser || currentUser.status === 'WAITLISTED') {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const [incomingRes, sentRes, activeRes] = await Promise.all([
                    api.get<ConnectionItem[]>('/connections/pending'),
                    api.get<ConnectionItem[]>('/connections/sent'),
                    api.get<ConnectionItem[]>('/connections/accepted')
                ]);

                setIncoming(incomingRes.data);
                setSent(sentRes.data);
                setActive(activeRes.data);

            } catch (err) {
                console.error('Error fetching connections:', err);
                setError((err as Error).message || 'Failed to fetch connections.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [currentUser, isLoadingAuth, refetchTrigger]);

    const handleAction = async (action: 'accept' | 'decline' | 'cancel' | 'remove', connectionId: number) => {
        if (currentUser?.status === 'WAITLISTED') return;
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
                case 'cancel':
                    promise = api.delete(`/connections/${connectionId}`);
                    successMessage = 'Connection request cancelled.';
                    break;
                case 'remove':
                    promise = api.delete(`/connections/${connectionId}`);
                    successMessage = 'Connection removed.';
                    break;
                default:
                    throw new Error('Unknown action');
            }
            await promise;
            toast.success(successMessage);
            setRefetchTrigger(prev => prev + 1);
        } catch (err) {
            console.error(`Error performing action ${action}:`, err);
            if (err instanceof AxiosError) {
                toast.error(err.response?.data?.detail || `Failed to ${action} connection.`);
            } else {
                toast.error(`An unexpected error occurred.`);
            }
        } finally {
            setIsProcessingAction(prev => ({ ...prev, [connectionId]: false }));
        }
    };

    const renderContent = () => {
        if (isLoading || isLoadingAuth) {
            return (
                <div>
                    <div className="h-8 w-1/4 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <Card className="p-4 mb-3">
                        <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </Card>
                </div>
            );
        }

        if (currentUser?.status === 'WAITLISTED') {
            return (
                <Alert variant="default" className="border-orange-500">
                    <AlertTitle className="text-orange-700">Feature Locked</AlertTitle>
                    <AlertDesc>
                        Your connections will appear here once you are actively assigned to a space.
                    </AlertDesc>
                </Alert>
            );
        }

        if (error) {
            return (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDesc>{error}</AlertDesc>
                </Alert>
            );
        }

        return (
            <>
                {/* --- Incoming Requests --- */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold tracking-tight mb-4 flex items-center">
                        <Inbox className="mr-3 h-6 w-6 text-primary" /> Invitations ({incoming.length})
                    </h2>
                    {incoming.length > 0 ? (
                        incoming.map(conn => (
                            <ConnectionActionCard
                                key={conn.id}
                                connection={conn}
                                perspective="incoming"
                                onAction={handleAction}
                                isProcessingAction={isProcessingAction}
                            />
                        ))
                    ) : (
                        <EmptyState 
                            icon={MailQuestion}
                            title="No pending invitations"
                            description="When someone requests to connect with you, you'll see their invitation here."
                        />
                    )}
                </section>

                {/* --- Active Connections --- */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold tracking-tight mb-4 flex items-center">
                        <Users className="mr-3 h-6 w-6 text-primary" /> Your Connections ({active.length})
                    </h2>
                    {active.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {active.map(conn => (
                                <UserConnectionCard
                                    key={conn.id}
                                    connection={conn}
                                    currentUserActualId={currentUser?.id}
                                    onAction={handleAction}
                                    isProcessingAction={isProcessingAction}
                                />
                            ))}
                        </div>
                    ) : (
                         <EmptyState 
                            icon={Users}
                            title="Find your community"
                            description="You haven't made any connections yet. Start exploring to find and connect with others."
                            action={{ href: '/discover', label: 'Discover People' }}
                        />
                    )}
                </section>

                {/* --- Sent Requests --- */}
                <section>
                    <h2 className="text-2xl font-semibold tracking-tight mb-4 flex items-center">
                        <Send className="mr-3 h-6 w-6 text-primary" /> Sent Requests ({sent.length})
                    </h2>
                    {sent.length > 0 ? (
                        sent.map(conn => (
                            <ConnectionActionCard
                                key={conn.id}
                                connection={conn}
                                perspective="sent"
                                onAction={handleAction}
                                isProcessingAction={isProcessingAction}
                            />
                        ))
                    ) : (
                        <EmptyState 
                            icon={Send}
                            title="No sent requests"
                            description="When you request to connect with someone, it will appear here until they respond."
                        />
                    )}
                </section>
            </>
        );
    };

    return (
        <AuthenticatedLayout>
            <div className="container mx-auto py-8 px-4 md:px-6 max-w-7xl">
                <h1 className="text-4xl font-bold tracking-tight mb-8">Connections</h1>
                {renderContent()}
            </div>
        </AuthenticatedLayout>
    );
};

export default ConnectionsPage;