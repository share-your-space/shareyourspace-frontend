'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore'; // Import auth store
import { fetchAuthenticated } from '@/lib/api'; // Import api helper
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { useChatStore } from '@/store/chatStore'; // Import chat store
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // ADDED
import { formatDistanceToNow, parseISO } from 'date-fns'; // ADDED for timestamp formatting

// Define structure for the User (matching backend schema)
interface User {
  id: number;
  full_name: string;
  email: string; // Added email for example
  role?: string; // Optional fields
  profile_picture_url?: string;
}

// Define structure for the Conversation Info from the API/Store
interface ConversationInfo {
  id: number; // Conversation ID
  other_user: User;
  last_message: {
    id: number;
    content: string;
    created_at: string;
    sender_id: number;
    read_at?: string | null;
  } | null;
  has_unread_messages: boolean; // Added from backend
}

interface ContactListProps {
    // onSelectUser now receives the full ConversationInfo object
    onSelectUser: (conversation: ConversationInfo) => void; 
    selectedUser: User | null; 
}

export function ContactList({ onSelectUser, selectedUser }: ContactListProps) {
    // State now holds conversations
    const [conversations, setConversations] = useState<ConversationInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const currentUserId = useAuthStore((state) => state.user?.id); // Keep current user ID check
    const onlineUserIds = useChatStore((state) => state.onlineUserIds); // Get online users
    const activeConversationId = useChatStore((state) => state.activeConversationId);

    // Fetch conversations instead of connections
    useEffect(() => {
        const fetchConversations = async () => {
            // No need to check currentUserId here, fetchAuthenticated handles token
            setIsLoading(true);
            setError(null);
            try {
                // Fetch user's conversations
                const response = await fetchAuthenticated('/chat/conversations');
                const fetchedConversations: ConversationInfo[] = await response.json();
                setConversations(fetchedConversations);
            } catch (err: any) {
                console.error("Failed to fetch conversations:", err);
                setError(err.message || "Could not load conversations.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();
    }, []); // Fetch only on initial mount

    // Effect to handle selecting conversation based on activeConversationId from store
    useEffect(() => {
        if (activeConversationId === null || conversations.length === 0) {
            return;
        }
        const activeConv = conversations.find(conv => conv.id === activeConversationId);
        if (activeConv) {
            if (selectedUser?.id !== activeConv.other_user.id) {
                console.log(`[ContactList] Active conversation ID ${activeConversationId} detected, selecting user ${activeConv.other_user.id}`);
                // Pass the whole conversation object when auto-selecting via activeConversationId
                onSelectUser(activeConv); 
            }
        } else {
             console.warn(`[ContactList] Active conversation ID ${activeConversationId} not found in the current list.`);
        }
    }, [activeConversationId, conversations, onSelectUser, selectedUser]); // Dependencies

    return (
        <div className="h-full w-full p-3 flex flex-col border-r bg-muted/20 dark:bg-muted/10">
            <h2 className="text-xl font-semibold mb-3 px-1 flex-shrink-0">Chats</h2>
            <div className="flex-grow overflow-y-auto space-y-0.5"> {/* Removed space-y-2, items will manage their own padding/margin */} 
                {isLoading && (
                    <ul className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <li key={i} className="p-2">
                                <Skeleton className="h-6 w-3/4" />
                            </li>
                        ))}
                    </ul>
                )}
                {!isLoading && error && (
                    <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {!isLoading && !error && conversations.length === 0 && (
                    <p className="text-sm text-muted-foreground p-2">No active chats.</p> // Changed text
                )}
                {!isLoading && !error && conversations.length > 0 && (
                    <ul className="divide-y divide-muted/40">
                        {conversations.map(conv => {
                            const participant = conv.other_user;
                            const isOnline = onlineUserIds.has(participant.id);
                            const isSelected = selectedUser?.id === participant.id;

                            // Basic initials for AvatarFallback
                            const getInitials = (name: string) => {
                                const names = name.split(' ');
                                if (names.length > 1) {
                                    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
                                }
                                return name.substring(0, 2).toUpperCase();
                            };

                            return (
                                <li key={conv.id} 
                                    onClick={() => onSelectUser(conv)} 
                                    className={`flex items-center space-x-3 p-2.5 rounded-lg cursor-pointer transition-colors duration-150 
                                                hover:bg-muted/60 dark:hover:bg-muted/30 
                                                ${isSelected ? 'bg-accent text-accent-foreground' : ''}`}
                                    data-selected={isSelected}
                                >
                                    <div className="relative flex-shrink-0">
                                        <Avatar className="h-10 w-10 border border-muted/20">
                                            <AvatarImage src={participant.profile_picture_url} alt={participant.full_name} />
                                            <AvatarFallback>{getInitials(participant.full_name)}</AvatarFallback>
                                        </Avatar>
                                        {isOnline && (
                                            <span 
                                                className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-background ring-1 ring-green-500/50 shadow-md"
                                                title="Online"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-grow overflow-hidden">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className={`text-sm font-medium truncate ${isSelected ? 'text-accent-foreground' : 'text-foreground'} ${conv.has_unread_messages ? 'font-semibold' : ''}`}>
                                                {participant.full_name}
                                            </h3>
                                            {conv.last_message && (
                                                <span className={`text-xs whitespace-nowrap ${isSelected ? 'text-accent-foreground/80' : 'text-muted-foreground/90'}`}>
                                                    {formatDistanceToNow(parseISO(conv.last_message.created_at), { addSuffix: true })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className={`text-xs truncate ${isSelected ? 'text-accent-foreground/70' : 'text-muted-foreground'} ${conv.has_unread_messages ? 'font-semibold text-foreground dark:text-slate-100' : ''}`}>
                                                {conv.last_message ? 
                                                    (conv.last_message.sender_id === currentUserId ? "You: " : "") + conv.last_message.content 
                                                    : "No messages yet"}
                                            </p>
                                            {conv.has_unread_messages && (
                                                <span className="flex-shrink-0 ml-2 h-2.5 w-2.5 bg-primary rounded-full" title="Unread messages"></span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
} 