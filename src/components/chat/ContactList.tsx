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

// Define structure for the Connection object from the API
interface Connection {
  id: number;
  requester_id: number;
  recipient_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  requester: User; // Embedded requester details
  recipient: User; // Embedded recipient details
}

interface ContactListProps {
    onSelectUser: (user: User) => void;
    selectedUser: User | null; // Pass down selectedUser for highlighting
}

export function ContactList({ onSelectUser, selectedUser }: ContactListProps) {
    const [contacts, setContacts] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const currentUserId = useAuthStore((state) => state.user?.id); // Get current user ID
    const onlineUserIds = useChatStore((state) => state.onlineUserIds); // Get online users

    useEffect(() => {
        const fetchContacts = async () => {
            if (!currentUserId) {
                // Might happen briefly before auth store hydration
                // setIsLoading(false); // Optionally stop loading if definitely not logged in
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetchAuthenticated('/connections/accepted');
                const connections: Connection[] = await response.json();

                // Extract the *other* user from each connection
                const otherUsers = connections.map(conn => {
                    return conn.requester_id === currentUserId ? conn.recipient : conn.requester;
                });

                setContacts(otherUsers);
            } catch (err: any) {
                console.error("Failed to fetch contacts:", err);
                setError(err.message || "Could not load contacts.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchContacts();
    }, [currentUserId]); // Re-fetch if currentUserId changes (e.g., after login)

    return (
        <div className="h-full w-full p-2 flex flex-col">
            <h2 className="text-lg font-semibold mb-2 flex-shrink-0">Contacts</h2>
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
                {!isLoading && !error && contacts.length === 0 && (
                    <p className="text-sm text-muted-foreground p-2">No contacts found.</p>
                )}
                {!isLoading && !error && contacts.length > 0 && (
                    <ul>
                        {contacts.map(user => {
                            const isOnline = onlineUserIds.has(user.id);
                            return (
                                <li key={user.id} 
                                    onClick={() => onSelectUser(user)} 
                                    className={`p-2 hover:bg-accent cursor-pointer rounded flex items-center justify-between ${
                                        selectedUser?.id === user.id ? 'bg-accent font-semibold' : ''
                                    }`}
                                >
                                    <span>{user.full_name}</span>
                                    {isOnline && <span className="h-2.5 w-2.5 rounded-full bg-green-500" title="Online"></span>}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
} 