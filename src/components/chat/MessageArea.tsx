'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { fetchAuthenticated, deleteChatMessage, editChatMessage } from '@/lib/api';
import { socket } from '@/lib/socket';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Check, CheckCheck, FileText, Download, SmilePlus, Pencil, Trash2 } from 'lucide-react';
import { format, isSameDay, isToday, isYesterday } from 'date-fns';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { useChatStore, MessageReaction, ReactionUpdatedEventPayload } from '@/store/chatStore';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
    updated_at?: string | null; // Ensure this is present and optional
    is_deleted: boolean;      // Ensure this is present
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

const MESSAGE_EDIT_DELETE_WINDOW_SECONDS = 300; // 5 minutes

// Helper function to process reactions for aggregated display
interface ProcessedReaction {
  emoji: string;
  count: number;
  currentUserReacted: boolean;
}

function processReactions(reactions: MessageReaction[], currentUserIdNum: number | undefined | null): ProcessedReaction[] {
  if (!reactions || reactions.length === 0) {
    return [];
  }

  const reactionMap = new Map<string, { count: number; userIds: Set<number> }>();

  reactions.forEach(reaction => {
    if (!reactionMap.has(reaction.emoji)) {
      reactionMap.set(reaction.emoji, { count: 0, userIds: new Set() });
    }
    const emojiData = reactionMap.get(reaction.emoji)!;
    emojiData.count++;
    emojiData.userIds.add(reaction.user_id);
  });

  return Array.from(reactionMap.entries()).map(([emoji, data]) => ({
    emoji,
    count: data.count,
    currentUserReacted: currentUserIdNum !== null && currentUserIdNum !== undefined && data.userIds.has(currentUserIdNum),
  })).sort((a, b) => b.count - a.count); // Optional: sort by most popular
}

// Helper function to render date separators
const renderDateSeparator = (date: Date) => {
  let label = '';
  if (isToday(date)) {
    label = 'Today';
  } else if (isYesterday(date)) {
    label = 'Yesterday';
  } else {
    label = format(date, 'MMMM d, yyyy'); // e.g., May 20, 2024
  }
  return (
    <div className="flex items-center justify-center my-3">
      <span className="px-3 py-1 text-xs font-semibold text-muted-foreground bg-muted rounded-full shadow-sm">
        {label}
      </span>
    </div>
  );
};

export function MessageArea({ selectedUser }: MessageAreaProps) {
  // All existing hooks, state, and functions will be commented out
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = useAuthStore((state) => state.user?.id);
  // Convert currentUserId to number for comparisons if it's a string
  const currentUserIdNum = typeof currentUserId === 'string' ? parseInt(currentUserId, 10) : currentUserId;
  const messagesEndRef = useRef<HTMLDivElement | null>(null); // Ref for scrolling
  const updateMessageReactionStore = useChatStore((state) => state.updateMessageReaction);
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<number | null>(null); // Stores message ID for which picker is open
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null); // State for hover

  // State for editing messages
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");

  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null); // ADDED: For delayed leave timer

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
        } catch (err: unknown) {
            console.error("Failed to fetch message history:", err);
            const message = err instanceof Error ? err.message : "Could not load messages.";
            setError(message);
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

        if (selectedUser && currentUserIdNum && newMessage.conversation_id) {
            console.log('[MessageArea] Condition 1 (selectedUser, currentUserIdNum, newMessage.conversation_id) met.');
            
            const isFromCurrentUser = newMessage.sender_id === currentUserIdNum;
            const isFromSelectedUser = newMessage.sender_id === selectedUser.id;

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

                if (newMessage.sender_id === selectedUser.id) { 
                    console.log('[MessageArea] Message from selectedUser, emitting markAsRead.');
                    emitMarkAsRead();
                }
            } else {
                 console.log(`[MessageArea] Condition 2 (isFromCurrentUser: ${isFromCurrentUser}, isFromSelectedUser: ${isFromSelectedUser}) FAILED. Message not added.`);
            }
        } else {
            console.log('[MessageArea] Condition 1 (selectedUser, currentUserIdNum, newMessage.conversation_id) FAILED. Details:',
                'selectedUser defined:', !!selectedUser, 
                'currentUserIdNum defined:', !!currentUserIdNum,
                'newMessage.conversation_id defined:', !!newMessage.conversation_id
            );
        }
    };

    const handleMessagesRead = (
        data: { reader_id: number; conversation_partner_id: number; count: number }
    ) => {
        if (data.conversation_partner_id === currentUserIdNum && data.reader_id === selectedUser?.id) {
            console.log(`Received messages_read event: User ${data.reader_id} read messages from me.`);
            setMessages(prevMessages => 
                prevMessages.map(msg => 
                    (msg.sender_id === currentUserIdNum && msg.recipient_id === selectedUser?.id && !msg.read_at) ? 
                    { ...msg, read_at: new Date().toISOString() } : 
                    msg
                )
            );
        }
    };

    console.log('Setting up socket listener for receive_message');
    socket.on('receive_message', handleReceiveMessage);
    socket.on('messages_read', handleMessagesRead); 

    const handleReactionUpdated = (payload: ReactionUpdatedEventPayload) => {
        console.log('Received reaction_updated event:', payload);
        updateMessageReactionStore(payload); 

        setMessages(prevMessages => 
            prevMessages.map(msg => {
                if (msg.id === payload.message_id) {
                    let newReactions = [...(msg.reactions || [])];
                    if (payload.action === 'added' && payload.reaction) {
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
    console.log('[MessageArea] Listeners for "reaction_updated":', socket.listeners('reaction_updated')); 
    console.log('[MessageArea] Does socket have "reaction_updated" listener?:', socket.hasListeners('reaction_updated'));

    const handleAnyEvent = (eventName: string, ...args: unknown[]) => {
      console.log(`[Socket.IO DEBUG] Event received on client: '${eventName}' with data:`, args);
    };
    socket.onAny(handleAnyEvent);

    const handleMessageUpdated = (updatedMessage: ChatMessageData) => {
        console.log('[MessageArea] Received message_updated event:', updatedMessage);
        setMessages(prevMessages =>
            prevMessages.map(msg =>
                msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg 
            )
        );
    };
    socket.on('message_updated', handleMessageUpdated);

    const handleMessageDeleted = (deletedMessage: ChatMessageData) => {
        console.log('[MessageArea] Received message_deleted event:', deletedMessage);
        setMessages(prevMessages =>
            prevMessages.map(msg =>
                msg.id === deletedMessage.id ? { ...msg, ...deletedMessage } : msg 
            )
        );
    };
    socket.on('message_deleted', handleMessageDeleted);

    return () => {
      console.log('[MessageArea] Cleaning up socket listeners. CurrentUserId:', currentUserId, 'SelectedUser:', selectedUser?.id);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('messages_read', handleMessagesRead);
      socket.off('reaction_updated', handleReactionUpdated); 
      socket.off('message_updated', handleMessageUpdated); 
      socket.off('message_deleted', handleMessageDeleted); 
      socket.offAny(handleAnyEvent); 
    };
  }, [currentUserIdNum, selectedUser, emitMarkAsRead, updateMessageReactionStore]);

  const handleStartEdit = (message: ChatMessageData) => {
    setEditingMessageId(message.id);
    setEditText(message.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const handleSaveEdit = async () => {
    if (editingMessageId === null || editText.trim() === "") return;

    try {
      await editChatMessage(editingMessageId, editText.trim());
      // Socket event 'message_updated' will handle the UI update.
      console.log(`Message ${editingMessageId} edit saved.`);
      handleCancelEdit(); // Reset editing state
    } catch (error) {
      console.error("Failed to save edited message:", error);
      alert("Error saving message. Please try again.");
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!window.confirm("Are you sure you want to delete this message? This cannot be undone.")) {
        return;
    }
    try {
        await deleteChatMessage(messageId);
        // UI update will be handled by socket event 'message_deleted'
        console.log(`Message ${messageId} delete request sent.`);
    } catch (error) {
        console.error("Failed to delete message:", error);
        alert("Error deleting message. Please try again.");
    }
  };

  const handleEmojiClick = async (messageId: number, emojiData: EmojiClickData) => {
    console.log(`Emoji clicked: ${emojiData.emoji} for message ${messageId}`);
    try {
        await toggleReactionApi(messageId, emojiData.emoji);
        console.log(`Reaction ${emojiData.emoji} toggled for message ${messageId}. Store/socket will update UI.`);
    } catch (error) {
        console.error("Failed to toggle reaction:", error);
        alert(`Error adding reaction: ${error instanceof Error ? error.message : String(error)}`);
    }
    setShowEmojiPickerFor(null); // Close picker after selection
  };

  const handleToggleReaction = async (messageId: number, emoji: string) => {
    console.log(`Toggling reaction: ${emoji} for message ${messageId} from existing bubble.`);
    try {
        await toggleReactionApi(messageId, emoji);
        console.log(`Reaction ${emoji} toggled for message ${messageId} via bubble. Store/socket will update UI.`);
    } catch (error) {
        console.error("Failed to toggle reaction from bubble:", error);
        alert(`Error toggling reaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Render Logic
  if (!selectedUser) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Select a contact to start chatting</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-2 p-4 border-b sticky top-0 bg-background z-10">Chat with {selectedUser.full_name}</h2>
      <div className="flex-grow p-4 overflow-y-auto space-y-2">
        {/* Message list */}
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
        {!isLoading && !error && messages.length > 0 && messages.map((msg, index, arr) => {
            const isCurrentUserSender = msg.sender_id === currentUserIdNum;
            const wasEdited = msg.updated_at && msg.created_at !== msg.updated_at;
            const createdAtDate = new Date(msg.created_at + 'Z'); // Keep original name for clarity with `isWithinTimeWindow`
            const now = new Date();
            const isWithinTimeWindow = (now.getTime() - createdAtDate.getTime()) < (MESSAGE_EDIT_DELETE_WINDOW_SECONDS * 1000);
            console.log(`Message ID: ${msg.id}, Created At: ${msg.created_at}, Parsed Date: ${createdAtDate.toISOString()}, Now: ${now.toISOString()}, Is Within Window: ${isWithinTimeWindow}`);

            const handleBubbleMouseEnter = () => {
                if (leaveTimerRef.current) {
                    clearTimeout(leaveTimerRef.current);
                    leaveTimerRef.current = null;
                }
                setHoveredMessageId(msg.id);
            };

            const handleBubbleMouseLeave = () => {
                if (leaveTimerRef.current) {
                    clearTimeout(leaveTimerRef.current);
                }
                leaveTimerRef.current = setTimeout(() => {
                    setHoveredMessageId(null);
                }, 150); // 150ms delay
            };

            const handlePopupMouseEnter = () => {
                if (leaveTimerRef.current) {
                    clearTimeout(leaveTimerRef.current);
                    leaveTimerRef.current = null;
                }
            };

            const handlePopupMouseLeave = () => {
                setHoveredMessageId(null);
            };

            const processedReactions = processReactions(msg.reactions || [], currentUserIdNum);

            let dateSeparatorElement = null;
            if (index === 0) {
                dateSeparatorElement = renderDateSeparator(createdAtDate);
            } else {
                const prevMessageDate = new Date(arr[index - 1].created_at + 'Z');
                if (!isSameDay(createdAtDate, prevMessageDate)) {
                    dateSeparatorElement = renderDateSeparator(createdAtDate);
                }
            }

            return (
                <React.Fragment key={msg.id}>
                    {dateSeparatorElement}
                    <div className="py-0.5">
                        <div className={`flex ${isCurrentUserSender ? 'justify-end' : 'justify-start'}`}>
                            <div 
                                className={`group relative p-3 rounded-xl max-w-[70%] shadow-sm ${isCurrentUserSender ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                                onMouseEnter={handleBubbleMouseEnter}
                                onMouseLeave={handleBubbleMouseLeave}
                            >
                                {msg.is_deleted ? (
                                    <p className="text-sm italic text-muted-foreground/80">This message was deleted.</p>
                                ) : editingMessageId === msg.id ? (
                                    <div className="space-y-2">
                                        <textarea 
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="w-full p-2 border rounded-md text-sm bg-background text-foreground focus:ring-1 focus:ring-primary"
                                            rows={3}
                                        />
                                        <div className="flex justify-end space-x-2">
                                            <button 
                                                onClick={handleCancelEdit} 
                                                className="text-xs p-1 px-2 bg-muted text-muted-foreground hover:bg-muted/80 rounded"
                                            >
                                                Cancel
                                            </button>
                                            <button onClick={handleSaveEdit} className="text-xs p-1 px-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded">Save</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {msg.attachment_url && (
                                            <div className="mb-2">
                                                {msg.attachment_mimetype?.startsWith('image/') ? (
                                                    <img 
                                                        src={msg.attachment_url} 
                                                        alt={msg.attachment_filename || 'attachment'} 
                                                        className="rounded-md max-w-full h-auto max-h-60 object-contain cursor-pointer" 
                                                        onClick={() => msg.attachment_url && window.open(msg.attachment_url, '_blank')}
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
                                    </>
                                )}
                                {editingMessageId !== msg.id && !msg.is_deleted && (
                                    <div className="flex items-center justify-end mt-1 space-x-1">
                                        <p className="text-xs opacity-70">
                                            {wasEdited && <span className="italic mr-1">(edited)</span>}
                                            {format(createdAtDate, 'p')}
                                        </p>
                                        {isCurrentUserSender && (
                                            <span className="text-xs">
                                                {msg.read_at ? 
                                                    <CheckCheck size={16} className="text-sky-600 dark:text-sky-400" />
                                                    : 
                                                    <Check size={16} className="text-muted-foreground opacity-60" />
                                                }
                                            </span>
                                        )}
                                    </div>
                                )}
                                {(() => {
                                    const showEditDeleteButtons = isCurrentUserSender && !msg.is_deleted && isWithinTimeWindow && editingMessageId !== msg.id;
                                    const showReactionTrigger = !msg.is_deleted && editingMessageId !== msg.id && hoveredMessageId === msg.id;

                                    if (showEditDeleteButtons || showReactionTrigger) {
                                        return (
                                            <div 
                                                className={`absolute top-1/2 -translate-y-1/2 right-full mr-1 p-1 space-x-0.5 bg-slate-100 dark:bg-slate-800 rounded-md shadow-lg z-20 flex items-center`}
                                                onMouseEnter={handlePopupMouseEnter}
                                                onMouseLeave={handlePopupMouseLeave}
                                            >
                                                {showEditDeleteButtons && (
                                                    <>
                                                        <button 
                                                            title="Edit message"
                                                            onClick={() => handleStartEdit(msg)}
                                                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button 
                                                            title="Delete message"
                                                            onClick={() => handleDeleteMessage(msg.id)}
                                                            className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {showReactionTrigger && (
                                                    <Popover open={showEmojiPickerFor === msg.id} onOpenChange={(open) => setShowEmojiPickerFor(open ? msg.id : null)}>
                                                        <PopoverTrigger asChild>
                                                            <button 
                                                                title="Add reaction"
                                                                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                                                            >
                                                                <SmilePlus size={16} />
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="p-0 w-auto border-none shadow-xl" side="bottom" align="start">
                                                            <EmojiPicker 
                                                                onEmojiClick={(emojiData) => handleEmojiClick(msg.id, emojiData)} 
                                                                height={350}
                                                                width={300}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                )}
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        </div>
                        {!msg.is_deleted && editingMessageId !== msg.id && processedReactions.length > 0 && (
                            <div className={`mt-1.5 flex items-center space-x-1.5 ${isCurrentUserSender ? 'justify-end' : 'justify-start pl-2'}`}>
                                {processedReactions.map(pReaction => (
                                    <button
                                        key={pReaction.emoji}
                                        onClick={() => handleToggleReaction(msg.id, pReaction.emoji)}
                                        title={pReaction.currentUserReacted ? `You reacted with ${pReaction.emoji}` : `React with ${pReaction.emoji}`}
                                        className={`px-2 py-0.5 rounded-full text-xs border flex items-center space-x-1 transition-colors ${
                                            pReaction.currentUserReacted 
                                                ? 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-700 dark:border-blue-500 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-600' 
                                                : 'bg-slate-100 border-slate-300 text-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }`}
                                    >
                                        <span>{pReaction.emoji}</span>
                                        {pReaction.count > 0 && <span className="font-medium">{pReaction.count}</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </React.Fragment>
            );
        })}
        <div ref={messagesEndRef} />
      </div>
      {/* The input area is handled by the parent ChatWindow component */}
    </div>
  );
}
