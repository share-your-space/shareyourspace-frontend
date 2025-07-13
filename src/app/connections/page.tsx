'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from "@/components/ui/card";
import { UserCheck, UserX, Inbox, Send, UserPlus, Trash2, MessageSquare, Users, MailQuestion } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Connection } from '@/types/connection';
import { mockConnections } from '@/lib/mock-data';

const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

const ConnectionActionCard: React.FC<{
    connection: Connection;
    perspective: 'incoming' | 'sent';
    onAction: (action: 'accept' | 'decline' | 'cancel', connectionId: string) => void;
}> = ({ connection, perspective, onAction }) => {
    
    const otherUser = perspective === 'incoming' ? connection.requester : connection.recipient;

    return (
        <Card className="p-4 transition-shadow hover:shadow-md mb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                    <Link href={`/users/${otherUser?.id}`}>
                        <Avatar className="h-16 w-16 border-2 border-transparent hover:border-primary transition-colors">
                            <AvatarImage src={otherUser?.profile_picture_url || undefined} alt={otherUser?.full_name || 'User'} />
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
};

const ConnectionCard: React.FC<{
    connection: Connection;
    currentUserId: string;
    onAction: (action: 'remove' | 'message', connectionId: string) => void;
}> = ({ connection, currentUserId, onAction }) => {
    const otherUser = connection.requester_id === currentUserId ? connection.recipient : connection.requester;

    return (
        <Card className="p-4 transition-shadow hover:shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                    <Link href={`/users/${otherUser?.id}`}>
                        <Avatar className="h-16 w-16 border-2 border-transparent hover:border-primary transition-colors">
                            <AvatarImage src={otherUser?.profile_picture_url || undefined} alt={otherUser?.full_name || 'User'} />
                            <AvatarFallback>{getInitials(otherUser?.full_name)}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div>
                         <Link href={`/users/${otherUser?.id}`} className="hover:underline">
                            <p className="font-bold text-lg">{otherUser?.full_name || `User ${otherUser?.id}`}</p>
                        </Link>
                        <p className="text-sm text-muted-foreground">{otherUser?.title || 'No title specified'}</p>
                    </div>
                </div>
                <div className="flex gap-2 self-end sm:self-center">
                    <Button size="sm" variant="destructive" onClick={() => onAction('remove', connection.id)}>
                        <UserX className="mr-1 h-4 w-4" />Remove
                    </Button>
                    <Button size="sm" onClick={() => onAction('message', otherUser.id)}>
                        <MessageSquare className="mr-1 h-4 w-4" />Message
                    </Button>
                </div>
            </div>
        </Card>
    );
};


export default function ConnectionsPage() {
    const currentUser = useAuthStore((state) => state.user);
    const [connections, setConnections] = useState<Connection[]>(mockConnections);
    const [activeTab, setActiveTab] = useState('connections');
    const { setActiveConversationId } = useChatStore();
    const router = useRouter();

    if (!currentUser) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Please log in to see your connections.</p>
            </div>
        );
    }

    const handleAction = (action: 'accept' | 'decline' | 'cancel' | 'remove' | 'message', connectionId: string) => {
        switch (action) {
            case 'accept':
                setConnections(prev => prev.map(c => c.id === connectionId ? { ...c, status: 'accepted' } : c));
                toast.success('Connection accepted!');
                break;
            case 'decline':
            case 'cancel':
                setConnections(prev => prev.filter(c => c.id !== connectionId));
                toast.info(action === 'decline' ? 'Connection declined.' : 'Connection request cancelled.');
                break;
            case 'remove':
                setConnections(prev => prev.filter(c => c.id !== connectionId));
                toast.error('Connection removed.');
                break;
            case 'message':
                const otherUserId = connectionId; // In this case, the ID passed is the other user's ID
                const existingConversation = connections.find(c => 
                    (c.requester_id === otherUserId && c.recipient_id === currentUser.id) ||
                    (c.recipient_id === otherUserId && c.requester_id === currentUser.id)
                );

                if (existingConversation) {
                    setActiveConversationId(existingConversation.id);
                }
                
                router.push('/chat');
                break;
        }
    };

    const incomingRequests = connections.filter(c => c.recipient_id === currentUser.id && c.status === 'pending');
    const sentRequests = connections.filter(c => c.requester_id === currentUser.id && c.status === 'pending');
    const acceptedConnections = connections.filter(c => c.status === 'accepted');

    const renderContent = () => {
        switch (activeTab) {
            case 'connections':
                return (
                    <div className="space-y-4">
                        {acceptedConnections.length > 0 ? (
                            acceptedConnections.map(conn => (
                                <ConnectionCard 
                                    key={conn.id} 
                                    connection={conn} 
                                    currentUserId={currentUser.id}
                                    onAction={(action, id) => handleAction(action, id)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-lg font-medium">No Connections Yet</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Start by exploring profiles in the Discover section.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href="/discover">Find Connections</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                );
            case 'incoming':
                return (
                    <div className="space-y-4">
                        {incomingRequests.length > 0 ? (
                            incomingRequests.map(req => (
                                <ConnectionActionCard 
                                    key={req.id} 
                                    connection={req} 
                                    perspective="incoming" 
                                    onAction={(action, id) => handleAction(action, id)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-lg font-medium">No Incoming Requests</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Your incoming connection requests will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                );
            case 'sent':
                return (
                    <div className="space-y-4">
                        {sentRequests.length > 0 ? (
                            sentRequests.map(req => (
                                <ConnectionActionCard 
                                    key={req.id} 
                                    connection={req} 
                                    perspective="sent" 
                                    onAction={(action, id) => handleAction(action, id)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <Send className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-lg font-medium">No Sent Requests</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Requests you send to others will be shown here.
                                </p>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight">Your Network</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your professional connections and requests.
                </p>
            </header>

            <div className="flex items-center justify-between mb-6 border-b">
                <div className="flex space-x-1">
                    <TabButton 
                        icon={<Users className="h-5 w-5" />}
                        label="Connections" 
                        count={acceptedConnections.length}
                        isActive={activeTab === 'connections'} 
                        onClick={() => setActiveTab('connections')} 
                    />
                    <TabButton 
                        icon={<MailQuestion className="h-5 w-5" />}
                        label="Incoming" 
                        count={incomingRequests.length}
                        isActive={activeTab === 'incoming'} 
                        onClick={() => setActiveTab('incoming')} 
                    />
                    <TabButton 
                        icon={<Send className="h-5 w-5" />}
                        label="Sent" 
                        count={sentRequests.length}
                        isActive={activeTab === 'sent'} 
                        onClick={() => setActiveTab('sent')} 
                    />
                </div>
                <Button asChild>
                    <Link href="/discover">
                        <UserPlus className="mr-2 h-4 w-4" /> Find New Connections
                    </Link>
                </Button>
            </div>

            {renderContent()}
        </div>
    );
}

const TabButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    count: number;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, count, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors
            ${isActive 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-primary hover:bg-muted'
            }`}
    >
        {icon}
        <span>{label}</span>
        {count > 0 && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold
                ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground text-white'}`}
            >
                {count}
            </span>
        )}
    </button>
);