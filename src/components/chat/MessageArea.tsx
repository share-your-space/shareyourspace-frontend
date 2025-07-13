'use client';

import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from 'lucide-react';
import { format, isSameDay, isToday, isYesterday } from 'date-fns';
import { useChatStore } from '@/store/chatStore';
import { ChatMessageData } from '@/types/chat';
import MessageBubble from './MessageBubble'; // Import the new MessageBubble component

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
    } = useChatStore(state => ({
        activeConversationId: state.activeConversationId,
        conversations: state.conversations,
    }));

    const activeConversation = useMemo(() => conversations.find(c => c.id === activeConversationId), [conversations, activeConversationId]);
    const messages = useMemo(() => activeConversation?.messages || [], [activeConversation]);

    const user = useAuthStore(state => state.user);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    if (!activeConversationId) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Info className="w-12 h-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">Welcome to Chat</h2>
                <p className="text-muted-foreground">Select a conversation to start messaging.</p>
            </div>
        );
    }

    if (messages.length === 0) {
        const otherUser = activeConversation?.participants.find(p => p.id !== user?.id);
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>No Messages Yet</AlertTitle>
                    <AlertDescription>
                        Be the first to send a message to {otherUser?.full_name || 'this contact'}.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    let lastMessageDate: Date | null = null;

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
