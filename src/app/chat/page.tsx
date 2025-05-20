'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { ContactList } from '@/components/chat/ContactList';
import { MessageArea } from '@/components/chat/MessageArea';
import { MessageInput } from '@/components/chat/MessageInput';
import { useChatStore } from '@/store/chatStore';
import { fetchAuthenticated } from '@/lib/api';

// Placeholder types - replace with actual types/interfaces later
interface User {
  id: number;
  full_name: string;
  email: string;
  profile_picture_url?: string;
  role?: string;
}

interface ConversationInfo {
  id: number; 
  other_user: User;
  last_message: {
    id: number;
    content: string;
    created_at: string;
    sender_id: number;
    read_at?: string | null; 
    // Add other fields from ChatMessageSchema if available/needed by frontend logic
    // e.g., reactions: any[]; // or a more specific Reaction[] type
  } | null; 
  has_unread_messages: boolean;
}

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<ConversationInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const searchParams = useSearchParams();
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);

  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchAuthenticated('/chat/conversations');
        const fetchedConversations: ConversationInfo[] = await response.json();
        setConversations(fetchedConversations);
      } catch (err: any) {
        console.error("Failed to fetch conversations:", err);
        setError(err.message || "Could not load conversations.");
      } finally {
        setIsLoading(false);
        setInitialLoadDone(true);
      }
    };
    fetchConversations();
  }, []);

  const handleSelectUser = useCallback(async (conversation: ConversationInfo) => {
    if (!conversation || !conversation.other_user) return;
    
    console.log(`[ChatPage] Selecting conversation ${conversation.id} with user ${conversation.other_user.full_name}`);
    setSelectedUser(conversation.other_user);
    setActiveConversationId(conversation.id);

    if (conversation.has_unread_messages) {
      console.log(`[ChatPage] Marking conversation ${conversation.id} as read.`);
      try {
        await fetchAuthenticated(`/chat/conversations/${conversation.id}/read`, { method: 'POST' });
        setConversations(prevConvs => 
          prevConvs.map(conv => 
            conv.id === conversation.id ? { ...conv, has_unread_messages: false } : conv
          )
        );
      } catch (err) {
        console.error(`[ChatPage] Failed to mark conversation ${conversation.id} as read:`, err);
      }
    }
  }, [setActiveConversationId]);

  useEffect(() => {
    if (!initialLoadDone || conversations.length === 0) return;

    const queryConvId = searchParams.get('conversationId');
    if (queryConvId) {
      const convId = parseInt(queryConvId, 10);
      if (!isNaN(convId)) {
        const targetConversation = conversations.find(conv => conv.id === convId);
        if (targetConversation) {
          if (selectedUser?.id !== targetConversation.other_user.id) {
             console.log(`[ChatPage] Selecting conversation ${convId} from query parameter.`);
             handleSelectUser(targetConversation);
          }
        } else {
           console.warn(`[ChatPage] Conversation ID ${convId} from query parameter not found in the list.`);
        }
      }
    }
  }, [searchParams, conversations, handleSelectUser, initialLoadDone, selectedUser]);

  return (
    <AuthenticatedLayout>
      <div className="flex h-[calc(100vh-var(--header-height))] border"> {/* Adjust height based on your layout header */} 
        <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
          {/* Column 1: Contact List */}
          <ResizablePanel defaultSize={25} maxSize={30} minSize={20}>
            <div className="flex h-full items-center justify-center p-2">
              <ContactList 
                conversations={conversations}
                isLoading={isLoading}
                error={error}
                onSelectUser={handleSelectUser} 
                selectedUser={selectedUser} 
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          {/* Column 2 & 3: Message Area & Input */}
          <ResizablePanel defaultSize={75}>
            <div className="flex flex-col h-full">
              {/* Message Area */} 
              <div className="flex-grow overflow-y-auto">
                <MessageArea 
                  key={selectedUser ? selectedUser.id : 'empty-chat'} 
                  selectedUser={selectedUser} 
                />
              </div>
              {/* Conditionally render Input Area */} 
              {selectedUser && (
                <div className="border-t bg-background"> {/* Removed p-4, MessageInput now has its own p-4 */}
                  <MessageInput selectedUser={selectedUser} />
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </AuthenticatedLayout>
  );
} 