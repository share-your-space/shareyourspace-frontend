'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { fetchAuthenticated, deleteChatMessage, editChatMessage, api } from '@/lib/api';
import { socket } from '@/lib/socket';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Check, CheckCheck, FileText, Download, SmilePlus, Pencil, Trash2, Info } from 'lucide-react';
import { format, isSameDay, isToday, isYesterday } from 'date-fns';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { useChatStore } from '@/store/chatStore';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { User, ChatMessageData, MessageReaction, ReactionUpdatedEventPayload } from '@/types/chat';

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

function processReactions(reactions: MessageReaction[] = [], currentUserIdNum: number | undefined | null): ProcessedReaction[] {
  if (!reactions || reactions.length === 0) return [];
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

export function MessageArea() {
  const { 
    conversations, 
    activeConversationId, 
    addMessage, 
    updateMessageReaction, 
    updateMessage,
    setActiveConversationId,
    setConversationLoading,
    setMessagesForConversation
  } = useChatStore();
  
  const currentUserId = useAuthStore((state) => state.user?.id);
  const currentUserIdNum = typeof currentUserId === 'string' ? parseInt(currentUserId, 10) : currentUserId;

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];
  const isLoadingMessages = activeConversation?.isLoadingMessages ?? true; // Default to true if no conversation

  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
        if (activeConversation && !activeConversation.messagesFetched && !activeConversation.isLoadingMessages) {
            setConversationLoading(activeConversation.id, true);
            try {
                if (!activeConversation.other_user?.id) {
                    console.error("Cannot fetch history, other user is missing.");
                    setConversationLoading(activeConversation.id, false);
                    return;
                }
                const response = await api.get<ChatMessageData[]>(`/chat/conversations/${activeConversation.other_user.id}/messages`);
                setMessagesForConversation(activeConversation.id, response.data);
            } catch (error) {
                console.error("Failed to fetch message history:", error);
                setConversationLoading(activeConversation.id, false);
            }
        }
    };
    fetchHistory();
  }, [activeConversation, setMessagesForConversation, setConversationLoading]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" }); // Use auto for initial load
  }, []);

  const emitMarkAsRead = useCallback(() => {
    if (activeConversationId && currentUserId) {
      const otherUserId = activeConversation?.other_user?.id;
      if (!otherUserId) return;
      // The backend uses the conversation ID to know which conversation to mark as read for the user
      socket.emit('mark_as_read', { conversation_id: activeConversationId, sender_id: otherUserId });
    }
  }, [activeConversationId, currentUserId, activeConversation]);

  // Initial scroll and mark as read
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
      emitMarkAsRead();
    }
  }, [messages.length, scrollToBottom, emitMarkAsRead]);

  useEffect(() => {
    if (!currentUserIdNum || !activeConversationId) return;

    const handleReceiveMessage = (newMessage: ChatMessageData) => {
        if (newMessage.conversation_id === activeConversationId) {
            addMessage(newMessage);
            // Mark as read immediately if the conversation is active
            emitMarkAsRead();
        }
    };

    const handleMessagesRead = (data: { reader_id: number; conversation_partner_id: number; conversation_id: number; read_at: string; }) => {
        if (data.conversation_id === activeConversationId && data.reader_id !== currentUserIdNum) {
            // A bit complex to update all messages, a refetch or a more specific store action might be better
            // For now, let's assume the component will re-render with new read statuses upon next load
            console.log(`Messages in conv ${data.conversation_id} read by user ${data.reader_id}`);
        }
    };
    
    const handleReactionUpdated = (payload: ReactionUpdatedEventPayload) => updateMessageReaction(payload);
    const handleMessageUpdated = (updatedMessage: ChatMessageData) => updateMessage(updatedMessage);
    const handleMessageDeleted = (deletedMessage: ChatMessageData) => updateMessage(deletedMessage);

    socket.on('receive_message', handleReceiveMessage);
    socket.on('messages_read', handleMessagesRead); 
    socket.on('reaction_updated', handleReactionUpdated);
    socket.on('message_updated', handleMessageUpdated);
    socket.on('message_deleted', handleMessageDeleted);
    
    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('messages_read', handleMessagesRead);
      socket.off('reaction_updated', handleReactionUpdated);
      socket.off('message_updated', handleMessageUpdated);
      socket.off('message_deleted', handleMessageDeleted);
    };
  }, [currentUserIdNum, activeConversationId, addMessage, updateMessageReaction, updateMessage, emitMarkAsRead]);

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
      handleCancelEdit();
    } catch (error) {
      console.error("Failed to save edited message:", error);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
        await deleteChatMessage(messageId);
    } catch (error) {
        console.error("Failed to delete message:", error);
    }
  };

  const handleEmojiClick = async (messageId: number, emojiData: EmojiClickData) => {
    try {
        await toggleReactionApi(messageId, emojiData.emoji);
    } catch (error) {
        console.error("Failed to toggle reaction:", error);
    }
    setShowEmojiPickerFor(null);
  };

  const handleToggleReaction = async (messageId: number, emoji: string) => {
    try {
        await toggleReactionApi(messageId, emoji);
    } catch (error) {
        console.error("Failed to toggle reaction from bubble:", error);
    }
  };

  if (!activeConversation) {
    // This state is now handled by the parent ChatPage, but as a fallback:
    return <div className="flex h-full items-center justify-center text-muted-foreground">Select a contact to start chatting</div>;
  }
  
  const selectedUser = activeConversation.other_user;
  if (!selectedUser) {
    // This case might happen if conversation data is incomplete.
    return (
        <div className="flex h-full items-center justify-center text-muted-foreground">
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Cannot load chat. User information is missing.</AlertDescription>
            </Alert>
        </div>
    );
  }

  const isExternal = activeConversation.is_external;

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-2 p-4 border-b sticky top-0 bg-background z-10">Chat with {selectedUser.full_name}</h2>
      {isExternal && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>External Chat</AlertTitle>
          <AlertDescription>
            This user is not yet a member of your space. Full collaboration features will be available once they are added.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex-grow p-4 overflow-y-auto space-y-2">
        {isLoadingMessages && messages.length === 0 && (
            <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className={`h-10 w-3/5 rounded-lg ${i % 2 === 0 ? 'ml-auto' : 'mr-auto'}`} />
                ))}
            </div>
        )}
        {!isLoadingMessages && messages.length === 0 && (
            <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
        )}
        {messages.map((msg, index, arr) => {
            const isCurrentUserSender = msg.sender_id === currentUserIdNum;
            const wasEdited = msg.updated_at && msg.created_at !== msg.updated_at;
            const createdAtDate = new Date(msg.created_at + 'Z');
            const now = new Date();
            const isWithinTimeWindow = (now.getTime() - createdAtDate.getTime()) < (MESSAGE_EDIT_DELETE_WINDOW_SECONDS * 1000);

            const handleBubbleMouseEnter = () => {
                if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
                setHoveredMessageId(msg.id);
            };

            const handleBubbleMouseLeave = () => {
                leaveTimerRef.current = setTimeout(() => setHoveredMessageId(null), 150);
            };

            const handlePopupMouseEnter = () => {
                if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
            };

            const handlePopupMouseLeave = () => setHoveredMessageId(null);

            const processedReactions = processReactions(msg.reactions, currentUserIdNum);

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
                                                className={`absolute top-1/2 -translate-y-1/2 ${isCurrentUserSender ? 'right-full mr-1' : 'left-full ml-1'} p-1 space-x-0.5 bg-slate-100 dark:bg-slate-800 rounded-md shadow-lg z-20 flex items-center`}
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
    </div>
  );
}
