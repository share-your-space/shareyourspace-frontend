'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore'; // Import auth store
import { fetchAuthenticated } from '@/lib/api'; // Import api helper
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { useChatStore } from '@/store/chatStore'; // Import chat store

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
        <div className="h-full w-full p-2 flex flex-col">
            <h2 className="text-lg font-semibold mb-2 flex-shrink-0">Chats</h2> {/* Changed title */} 
            <div className="flex-grow overflow-y-auto">
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
                    <ul>
                        {/* Map over conversations */} 
                        {conversations.map(conv => {
                            const participant = conv.other_user;
                            const isOnline = onlineUserIds.has(participant.id);
                            return (
                                <li key={conv.id} 
                                    // Pass the whole conversation object on click
                                    onClick={() => onSelectUser(conv)} 
                                    className={`p-2 hover:bg-accent cursor-pointer rounded flex items-center justify-between ${
                                        selectedUser?.id === participant.id ? 'bg-accent font-semibold' : ''
                                    }`}
                                >
                                    <span className={`flex items-center ${conv.has_unread_messages ? 'font-bold' : ''}`}>
                                        {conv.has_unread_messages && (
                                            <span className="h-2 w-2 bg-blue-500 rounded-full mr-2" title="Unread messages"></span>
                                        )}
                                        {participant.full_name}
                                    </span>
                                    {isOnline && <span className="h-2.5 w-2.5 rounded-full bg-green-500 ml-2" title="Online"></span>}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
} 