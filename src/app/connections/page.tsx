'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, UserX, Inbox, Send, UserPlus, Trash2, MessageSquare, Users, MailQuestion } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

// --- Mock Data ---

const mockUsers: Record<number, UserReference> = {
    1: { id: 1, full_name: 'Sarah Lee', title: 'Product Manager at Innovate Inc.', profile_picture_signed_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop' },
    2: { id: 2, full_name: 'Tom Chen', title: 'Frontend Developer at TechCorp', profile_picture_signed_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop' },
    3: { id: 3, full_name: 'Maria Garcia', title: 'UX Designer at Creative Minds', profile_picture_signed_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop' },
    4: { id: 4, full_name: 'David Miller', title: 'Data Scientist at DataDriven', profile_picture_signed_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop' },
    5: { id: 5, full_name: 'Jessica Brown', title: 'CEO of StartupX', profile_picture_signed_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop' },
    6: { id: 6, full_name: 'Michael Wilson', title: 'Backend Engineer at Cloud Solutions', profile_picture_signed_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop' },
};

const initialConnections: ConnectionItem[] = [
    { id: 101, requester_id: 2, recipient_id: 1, status: 'pending', created_at: '2025-07-10T10:00:00Z', requester: mockUsers[2], recipient: mockUsers[1] },
    { id: 102, requester_id: 3, recipient_id: 1, status: 'pending', created_at: '2025-07-09T14:30:00Z', requester: mockUsers[3], recipient: mockUsers[1] },
    { id: 103, requester_id: 1, recipient_id: 4, status: 'pending', created_at: '2025-07-11T09:00:00Z', requester: mockUsers[1], recipient: mockUsers[4] },
    { id: 104, requester_id: 5, recipient_id: 1, status: 'accepted', created_at: '2025-06-20T11:00:00Z', requester: mockUsers[5], recipient: mockUsers[1] },
    { id: 105, requester_id: 1, recipient_id: 6, status: 'accepted', created_at: '2025-06-15T18:00:00Z', requester: mockUsers[1], recipient: mockUsers[6] },
];

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
    updated_at?: string;
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
}> = ({ connection, perspective, onAction }) => {
    
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
                            <Button size="sm" variant="outline" onClick={() => onAction('decline', connection.id)}>
                                <UserX className="mr-1 h-4 w-4" />Decline
                            </Button>
                            <Button size="sm" onClick={() => onAction('accept', connection.id)}>
                                <UserCheck className="mr-1 h-4 w-4" />Accept
                            </Button>
                        </>
                    )}
                    {perspective === 'sent' && (
                        <Button size="sm" variant="destructive" onClick={() => onAction('cancel', connection.id)}>
                           <Trash2 className="mr-1 h-4 w-4" />Cancel
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
}> = ({ connection, currentUserActualId, onAction }) => {
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
                <Button variant="destructive" size="sm" onClick={() => onAction('remove', connection.id)} className="flex-1">
                    <UserX className="mr-2 h-4 w-4" />Remove
                </Button>
            </div>
        </Card>
    );
};

const EmptyState: React.FC<{
    icon: React.ComponentType<{ className?: string }>;
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
    const [connections, setConnections] = useState<ConnectionItem[]>(initialConnections);
    const currentUser = useAuthStore(state => state.user);
    const currentUserActualId = currentUser?.id || 1; // Default to 1 for mock

    const incoming = connections.filter(c => c.recipient_id === currentUserActualId && c.status === 'pending');
    const sent = connections.filter(c => c.requester_id === currentUserActualId && c.status === 'pending');
    const active = connections.filter(c => c.status === 'accepted' && (c.requester_id === currentUserActualId || c.recipient_id === currentUserActualId));

    const handleAction = (action: 'accept' | 'decline' | 'cancel' | 'remove', connectionId: number) => {
        let successMessage = '';
        
        setConnections(prevConnections => {
            const connIndex = prevConnections.findIndex(c => c.id === connectionId);
            if (connIndex === -1) return prevConnections;

            const newConnections = [...prevConnections];
            const connection = newConnections[connIndex];

            switch (action) {
                case 'accept':
                    newConnections[connIndex] = { ...connection, status: 'accepted' };
                    successMessage = `You are now connected with ${connection.requester.full_name}!`;
                    break;
                case 'decline':
                    newConnections.splice(connIndex, 1);
                    successMessage = `Declined connection request from ${connection.requester.full_name}.`;
                    break;
                case 'cancel':
                    newConnections.splice(connIndex, 1);
                    successMessage = 'Connection request cancelled.';
                    break;
                case 'remove':
                    const otherUser = connection.requester_id === currentUserActualId ? connection.recipient : connection.requester;
                    newConnections.splice(connIndex, 1);
                    successMessage = `Connection with ${otherUser.full_name} removed.`;
                    break;
                default:
                    return prevConnections;
            }
            return newConnections;
        });

        toast.success(successMessage);
    };

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 max-w-7xl">
            <h1 className="text-4xl font-bold tracking-tight mb-8">Connections</h1>
            
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
                                currentUserActualId={currentUserActualId}
                                onAction={handleAction}
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
        </div>
    );
};

export default ConnectionsPage;