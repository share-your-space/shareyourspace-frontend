'use client';

import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from 'lucide-react';
import { format, isSameDay, isToday, isYesterday } from 'date-fns';
import { useChatStore } from '@/store/chatStore';
import { ChatMessageData } from '@/types/chat';
import MessageBubble from './MessageBubble'; // Import the new MessageBubble component
import { api } from '@/lib/api';

// Helper function to render date separators
const renderDateSeparator = (date: Date) => {
  let label = '';
  if (isToday(date)) {
    label = 'Today';
  } else if (isYesterday(date)) {
    label = 'Yesterday';
  } else {
    label = format(date, 'MMMM d, yyyy');
  }
  return (
    <div className="flex items-center justify-center my-4">
      <span className="px-3 py-1 text-xs font-semibold text-muted-foreground bg-muted rounded-full shadow-sm">
        {label}
      </span>
    </div>
  );
};

const MessageArea: React.FC = () => {
    const {
        activeConversationId,
        conversations,
        setConversationLoading,
        loadMessagesForConversation,
    } = useChatStore(state => ({
        activeConversationId: state.activeConversationId,
        conversations: state.conversations,
        setConversationLoading: state.setConversationLoading,
        loadMessagesForConversation: state.loadMessagesForConversation,
    }));

    const activeConversation = useMemo(() => conversations.find(c => c.id === activeConversationId), [conversations, activeConversationId]);
    const messages = useMemo(() => activeConversation?.messages || [], [activeConversation]);
    const isLoadingMessages = activeConversation?.isLoadingMessages || false;
    const hasMoreMessages = activeConversation?.hasMoreMessages ?? true;
    const messagesFetched = activeConversation?.messagesFetched || false;

    const user = useAuthStore(state => state.user);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const observer = useRef<IntersectionObserver | null>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const fetchMessages = useCallback(async (conversationId: number, loadMore = false) => {
        const conversation = useChatStore.getState().conversations.find(c => c.id === conversationId);
        if (!conversation || conversation.isLoadingMessages) return;

        setConversationLoading(conversationId, true);
        try {
            const page = loadMore ? Math.floor((conversation.messages?.length || 0) / 20) + 1 : 1;
            const response = await api.get(`/chat/conversations/${conversationId}/messages?page=${page}&limit=20`);
            const { messages: fetchedMessages, has_more } = response.data;
            loadMessagesForConversation(conversationId, fetchedMessages, has_more);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
            setConversationLoading(conversationId, false);
        }
    }, [setConversationLoading, loadMessagesForConversation]);


    useEffect(() => {
        if (activeConversationId && !messagesFetched && !isLoadingMessages) {
            fetchMessages(activeConversationId);
        }
    }, [activeConversationId, messagesFetched, isLoadingMessages, fetchMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const loadMoreMessagesCallback = useCallback((node: HTMLDivElement) => {
        if (isLoadingMessages) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMoreMessages && activeConversationId) {
                fetchMessages(activeConversationId, true);
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoadingMessages, hasMoreMessages, activeConversationId, fetchMessages]);

    if (!activeConversationId) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Info className="w-12 h-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">Welcome to Chat</h2>
                <p className="text-muted-foreground">Select a conversation to start messaging.</p>
            </div>
        );
    }

    if (isLoadingMessages && messages.length === 0) {
        return (
            <div className="p-4 space-y-4">
                <Skeleton className="h-16 w-3/4" />
                <Skeleton className="h-16 w-3/4 ml-auto" />
                <Skeleton className="h-16 w-1/2" />
            </div>
        );
    }

    if (!isLoadingMessages && messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>No Messages Yet</AlertTitle>
                    <AlertDescription>
                        Be the first to send a message to {activeConversation?.other_user?.full_name || 'this contact'}.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    let lastMessageDate: Date | null = null;

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {hasMoreMessages && !isLoadingMessages && <div ref={loadMoreMessagesCallback} style={{ height: '1px' }} />}
            {isLoadingMessages && messages.length > 0 && (
                <div className="flex justify-center">
                    <Skeleton className="h-8 w-24 rounded-full" />
                </div>
            )}
            {messages.map((message: ChatMessageData) => {
                const messageDate = new Date(message.created_at);
                const showDateSeparator = lastMessageDate === null || !isSameDay(messageDate, lastMessageDate);
                lastMessageDate = messageDate;
                const isOwnMessage = message.sender_id === user?.id;

                return (
                    <React.Fragment key={message.id}>
                        {showDateSeparator && renderDateSeparator(messageDate)}
                        <MessageBubble message={message} isOwnMessage={isOwnMessage} />
                    </React.Fragment>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageArea;
