'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { fetchAuthenticated } from '@/lib/api';
import { socket } from '@/lib/socket';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Check, CheckCheck, FileText, Download, SmilePlus } from 'lucide-react';
import { format } from 'date-fns';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { useChatStore, MessageReaction, ReactionUpdatedEventPayload } from '@/store/chatStore';

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
    reactions?: MessageReaction[];
}

interface MessageAreaProps {
  selectedUser: User | null;
}

// API function to toggle a reaction
async function toggleReactionApi(messageId: number, emoji: string): Promise<MessageReaction | null> {
    const response = await fetchAuthenticated(`/chat/messages/${messageId}/reactions`, {
        method: 'POST',
        body: JSON.stringify({ emoji }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to toggle reaction" }));
        throw new Error(errorData.detail || "Failed to toggle reaction");
    }
    // Backend returns the reaction object if added, or null/empty if removed by toggle
    // It might return 204 No Content for removal, handle that by checking response.status or content length
    if (response.status === 204 || response.headers.get("content-length") === "0") {
        return null; 
    }
    return response.json();
}

export function MessageArea({ selectedUser }: MessageAreaProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const messagesEndRef = useRef<HTMLDivElement | null>(null); // Ref for scrolling
  const updateMessageReactionStore = useChatStore((state) => state.updateMessageReaction);
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<number | null>(null); // Stores message ID for which picker is open
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null); // State for hover

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
    console.log('[MessageArea] Socket useEffect running. CurrentUserId:', currentUserId, 'SelectedUser:', selectedUser?.id);

    if (!currentUserId || !selectedUser) { 
      console.log('[MessageArea] Socket listeners not attached (no current user or selected user).');
      return;
    }

    const handleReceiveMessage = (newMessage: ChatMessageData) => {
        console.log('[MessageArea] handleReceiveMessage triggered. NewMessage:', JSON.stringify(newMessage, null, 2));
        console.log('[MessageArea] Current state for handleReceiveMessage: selectedUser ID:', selectedUser?.id, 'currentUserId:', currentUserId);

        if (selectedUser && currentUserId && newMessage.conversation_id) {
            console.log('[MessageArea] Condition 1 (selectedUser, currentUserId, newMessage.conversation_id) met.');
            
            const isFromCurrentUser = newMessage.sender_id === currentUserId;
            const isFromSelectedUser = newMessage.sender_id === selectedUser.id;

            // Message is relevant if it involves the current user and the selected user in this conversation.
            // For 1-on-1, this means the sender is either the current user or the selected user,
            // AND the message pertains to their shared conversation_id.
            // The backend should be rooming correctly, so a message arriving here should be intended for this conversation.
            if (isFromCurrentUser || isFromSelectedUser) { 
                 console.log(`[MessageArea] Condition 2 (isFromCurrentUser: ${isFromCurrentUser}, isFromSelectedUser: ${isFromSelectedUser}) met.`);
                setMessages((prevMessages) => {
                    console.log('[MessageArea] Inside setMessages. Prev message count:', prevMessages.length, 'New message ID:', newMessage.id);
                    if (prevMessages.find(msg => msg.id === newMessage.id)) {
                        console.log('[MessageArea] Message ID ', newMessage.id, ' already exists in prevMessages. Not adding.');
                        return prevMessages;
                    }
                    const updatedMessages = [...prevMessages, newMessage];
                    console.log('[MessageArea] Adding new message ID ', newMessage.id, '. New message count:', updatedMessages.length);
                    return updatedMessages;
                });

                if (newMessage.sender_id === selectedUser.id) { // If from selected user, emit mark as read
                    console.log('[MessageArea] Message from selectedUser, emitting markAsRead.');
                    emitMarkAsRead();
                }
            } else {
                 console.log(`[MessageArea] Condition 2 (isFromCurrentUser: ${isFromCurrentUser}, isFromSelectedUser: ${isFromSelectedUser}) FAILED. Message not added.`);
            }
        } else {
            console.log('[MessageArea] Condition 1 (selectedUser, currentUserId, newMessage.conversation_id) FAILED. Details:',
                'selectedUser defined:', !!selectedUser, 
                'currentUserId defined:', !!currentUserId, 
                'newMessage.conversation_id defined:', !!newMessage.conversation_id
            );
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

    // Listen for reaction updates
    const handleReactionUpdated = (payload: ReactionUpdatedEventPayload) => {
        console.log('Received reaction_updated event:', payload);
        updateMessageReactionStore(payload); // Keep updating the store as the source of truth

        // Also update local component state for immediate UI refresh
        setMessages(prevMessages => 
            prevMessages.map(msg => {
                if (msg.id === payload.message_id) {
                    let newReactions = [...(msg.reactions || [])];
                    if (payload.action === 'added' && payload.reaction) {
                        // Avoid duplicates: remove existing reaction by this user with this emoji first
                        newReactions = newReactions.filter(
                            r => !(r.user_id === payload.user_id_who_reacted && r.emoji === payload.emoji)
                        );
                        newReactions.push(payload.reaction);
                    } else if (payload.action === 'removed') {
                        newReactions = newReactions.filter(
                            r => !(r.user_id === payload.user_id_who_reacted && r.emoji === payload.emoji)
                        );
                    }
                    return { ...msg, reactions: newReactions };
                }
                return msg;
            })
        );
    };
    console.log('[MessageArea] PRE - Attaching listener for reaction_updated');
    socket.on('reaction_updated', handleReactionUpdated);
    console.log('[MessageArea] POST - Listener for reaction_updated should be attached');
    console.log('[MessageArea] Socket ID on client:', socket.id); 
    console.log('[MessageArea] Socket connected status:', socket.connected);
    // Check how many listeners are registered for 'reaction_updated'. Should be 1 after setup.
    console.log('[MessageArea] Listeners for "reaction_updated":', socket.listeners('reaction_updated')); 
    // For debugging, see all registered listeners on this socket instance
    // console.log('[MessageArea] All event listeners (socket.events):', (socket as any).eio.events); // May not be public API, use with caution or check socket.io-client docs
    // A more reliable way to see if listeners are generally working:
    console.log('[MessageArea] Does socket have "reaction_updated" listener?:', socket.hasListeners('reaction_updated'));

    // Catch-all listener for debugging
    const handleAnyEvent = (eventName: string, ...args: any[]) => {
      console.log(`[Socket.IO DEBUG] Event received on client: '${eventName}' with data:`, args);
    };
    socket.onAny(handleAnyEvent);

    // Cleanup: remove listener when component unmounts or selectedUser changes
    return () => {
      console.log('[MessageArea] Cleaning up socket listeners. CurrentUserId:', currentUserId, 'SelectedUser:', selectedUser?.id);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('messages_read', handleMessagesRead);
      socket.off('reaction_updated', handleReactionUpdated); // Cleanup reaction listener
      socket.offAny(handleAnyEvent); // Cleanup catch-all listener
    };
  }, [currentUserId, selectedUser, emitMarkAsRead, updateMessageReactionStore]); // Added updateMessageReactionStore to dependencies

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
                <div // New wrapper div for hover effect
                    key={msg.id} 
                    className="relative group" // Added relative and group for potential future styling
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                >
                    <div className={`flex ${isCurrentUserSender ? 'justify-end' : 'justify-start'}`}>
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
                    {/* Reactions display and Add Reaction button */}
                    <div className={`flex items-center gap-1 mt-1 ${isCurrentUserSender ? 'justify-end' : 'justify-start'}`}>
                        {(msg.reactions || []).map(reaction => (
                            <button 
                                key={reaction.id || `reaction-${msg.id}-${reaction.emoji}-${reaction.user_id}`}
                                onClick={async () => {
                                    if (currentUserId === reaction.user_id) {
                                        try {
                                            await toggleReactionApi(msg.id, reaction.emoji);
                                        } catch (error) {
                                            console.error("Failed to toggle reaction:", error);
                                        }
                                    }
                                }}
                                className={`px-1.5 py-0.5 rounded-full text-base transition-colors ${
                                    reaction.user_id === currentUserId 
                                        ? 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-700 dark:hover:bg-blue-600' 
                                        : 'bg-gray-100 dark:bg-gray-700 cursor-default'
                                }`}
                                title={reaction.user_id === currentUserId ? "Click to remove" : ""}
                            >
                                {reaction.emoji}
                            </button>
                        ))}
                        {/* Conditionally render Add reaction button based on hover */}
                        {(hoveredMessageId === msg.id || showEmojiPickerFor === msg.id) && (
                            <button 
                                onClick={() => setShowEmojiPickerFor(showEmojiPickerFor === msg.id ? null : msg.id)} 
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                aria-label="Add reaction"
                            >
                                <SmilePlus size={18} className="text-muted-foreground" />
                            </button>
                        )}
                    </div>
                    {/* Emoji Picker */} 
                    {showEmojiPickerFor === msg.id && (
                        <div className={`mt-2 ${isCurrentUserSender ? 'flex justify-end' : 'flex justify-start'}`}>
                            <div className="absolute z-20" ref={el => { /* Logic to close picker if clicked outside can be added here */ }}>
                                <EmojiPicker 
                                    onEmojiClick={async (emojiData: EmojiClickData) => {
                                        try {
                                            await toggleReactionApi(msg.id, emojiData.emoji);
                                            setShowEmojiPickerFor(null);
                                        } catch (error) {
                                            console.error("Failed to add reaction:", error);
                                            setShowEmojiPickerFor(null);
                                        }
                                    }}
                                    height={350}
                                    width={300}
                                />
                            </div>
                        </div>
                    )}
                </div>
            );
        })}
        {/* Empty div at the end to scroll into view */} 
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}