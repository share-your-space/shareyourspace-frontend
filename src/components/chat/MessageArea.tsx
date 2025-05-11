'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { fetchAuthenticated } from '@/lib/api';
import { socket } from '@/lib/socket';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Check, CheckCheck, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';

// Match backend User schema
interface User {
    id: number;
    full_name: string;
    email: string;
    profile_picture_url?: string;
    role?: string;
}

// Match backend ChatMessage schema (schemas.chat.ChatMessage)
interface ChatMessageData {
    id: number;
    sender_id: number;
    recipient_id: number;
    conversation_id?: number | null;
    content: string;
    created_at: string; // ISO string format from backend
    read_at?: string | null;
    sender: User; // Embedded sender
    attachment_url?: string | null;
    attachment_filename?: string | null;
    attachment_mimetype?: string | null;
}

interface MessageAreaProps {
  selectedUser: User | null;
}

export function MessageArea({ selectedUser }: MessageAreaProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const messagesEndRef = useRef<HTMLDivElement | null>(null); // Ref for scrolling

  // Function to scroll to the bottom of the message list
  const scrollToBottom = useCallback(() => {
    const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const emitMarkAsRead = useCallback(() => {
    if (selectedUser && currentUserId) {
      // Emit that messages *from* selectedUser *to* currentUserId are being read.
      socket.emit('mark_as_read', { sender_id: selectedUser.id });
      console.log(`Emitted mark_as_read for messages from sender ${selectedUser.id}`);
    }
  }, [selectedUser, currentUserId]);

  // Fetch message history when selectedUser changes
  useEffect(() => {
    const fetchHistory = async () => {
        if (!selectedUser || !currentUserId) {
            setMessages([]); // Clear messages if no user selected
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            console.log(`Fetching messages for user ${selectedUser.id}...`);
            const response = await fetchAuthenticated(`/chat/conversations/${selectedUser.id}/messages`);
            const history: ChatMessageData[] = await response.json();
            setMessages(history);
            emitMarkAsRead(); // Mark messages as read once history is loaded
        } catch (err: any) {
            console.error("Failed to fetch message history:", err);
            setError(err.message || "Could not load messages.");
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    };

    fetchHistory();
  }, [selectedUser, currentUserId, emitMarkAsRead]);

  // Scroll to bottom when messages load initially or when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Socket listener for incoming messages
  useEffect(() => {
    if (!currentUserId || !selectedUser) return; // Only listen if a user is selected

    const handleReceiveMessage = (newMessage: ChatMessageData) => {
        console.log('Received message via socket:', newMessage);
        // Ensure selectedUser and currentUserId are defined and newMessage has a conversation_id
        if (selectedUser && currentUserId && newMessage.conversation_id) {
            // If the message is from me OR from the person I'm currently chatting with,
            // assume it's for the current active chat because it has a conversation_id
            // and socket events are typically targeted.
            if (newMessage.sender_id === currentUserId || newMessage.sender_id === selectedUser.id) {
                setMessages((prevMessages) => {
                    // Avoid adding duplicate messages if socket emits something already fetched or resent
                    if (prevMessages.find(msg => msg.id === newMessage.id)) {
                        return prevMessages;
                    }
                    return [...prevMessages, newMessage];
                });
                // If the received message is from the currently selected user, mark it as read
                if (newMessage.sender_id === selectedUser.id) {
                    emitMarkAsRead();
                }
            }
        }
    };

    const handleMessagesRead = (
        data: { reader_id: number; conversation_partner_id: number; count: number }
    ) => {
        // This event is received by the SENDER when the RECIPIENT has read their messages.
        // reader_id is the one who read (i.e. selectedUser.id if current user sent the message)
        // conversation_partner_id is the one who sent the messages (i.e. currentUserId)
        if (data.conversation_partner_id === currentUserId && data.reader_id === selectedUser?.id) {
            console.log(`Received messages_read event: User ${data.reader_id} read messages from me.`);
            setMessages(prevMessages => 
                prevMessages.map(msg => 
                    (msg.sender_id === currentUserId && msg.recipient_id === selectedUser?.id && !msg.read_at) ? 
                    { ...msg, read_at: new Date().toISOString() } : // Simulate read by setting a time
                    msg
                )
            );
        }
    };

    console.log('Setting up socket listener for receive_message');
    socket.on('receive_message', handleReceiveMessage);
    socket.on('messages_read', handleMessagesRead); // Listen for read confirmations

    // Cleanup: remove listener when component unmounts or selectedUser changes
    return () => {
      console.log('Cleaning up socket listener for receive_message');
      socket.off('receive_message', handleReceiveMessage);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [currentUserId, selectedUser, emitMarkAsRead]); // Re-run effect if current user or selected user changes

  // Render Logic
  if (!selectedUser) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Select a contact to start chatting</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-2 p-4 border-b sticky top-0 bg-background z-10">Chat with {selectedUser.full_name}</h2>
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {isLoading && (
            <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className={`h-10 w-3/5 rounded-lg ${i % 2 === 0 ? 'ml-auto' : 'mr-auto'}`} />
                ))}
            </div>
        )}
        {!isLoading && error && (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Messages</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {!isLoading && !error && messages.length === 0 && (
            <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
        )}
        {!isLoading && !error && messages.length > 0 && messages.map(msg => {
            const isCurrentUserSender = msg.sender_id === currentUserId;
            return (
                <div key={msg.id} className={`flex ${isCurrentUserSender ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-lg max-w-[70%] shadow-sm ${isCurrentUserSender ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {msg.attachment_url && (
                            <div className="mb-2">
                                {msg.attachment_mimetype?.startsWith('image/') ? (
                                    <img 
                                        src={msg.attachment_url} 
                                        alt={msg.attachment_filename || 'attachment'} 
                                        className="rounded-md max-w-full h-auto max-h-60 object-contain cursor-pointer" 
                                        onClick={() => window.open(msg.attachment_url, '_blank')}
                                    />
                                ) : (
                                    <a 
                                        href={msg.attachment_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className={`flex items-center space-x-2 p-2 rounded-md hover:bg-opacity-20 transition-colors ${
                                            isCurrentUserSender ? 'hover:bg-primary-foreground/20' : 'hover:bg-accent'
                                        }`}
                                    >
                                        <FileText size={24} className={isCurrentUserSender ? 'text-primary-foreground/80' : 'text-muted-foreground'} />
                                        <span className="text-sm truncate">
                                            {msg.attachment_filename || 'View Attachment'}
                                        </span>
                                        <Download size={16} className={`ml-auto ${isCurrentUserSender ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`} />
                                    </a>
                                )}
                            </div>
                        )}
                        {msg.content && (
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        )}
                        <div className="flex items-center justify-end mt-1 space-x-1">
                            <p className="text-xs opacity-70">
                                {format(new Date(msg.created_at), 'p')}
                            </p>
                            {isCurrentUserSender && (
                                <span className="text-xs">
                                    {msg.read_at ? <CheckCheck size={16} className="text-blue-500" /> : <Check size={16} className="opacity-60" />}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            );
        })}
        {/* Empty div at the end to scroll into view */} 
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
} 