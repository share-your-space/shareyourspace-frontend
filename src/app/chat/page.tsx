'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ContactList } from '@/components/chat/ContactList';
import { MessageArea } from '@/components/chat/MessageArea';
import { MessageInput } from '@/components/chat/MessageInput';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { Conversation, Message, User } from '@/types/chat';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, MessageSquare } from "lucide-react";
import { ChatHeader } from '@/components/chat/ChatHeader';

// --- MOCK DATA ---
const mockUsers: Record<string, User> = {
  '1': { id: 1, full_name: 'Test User', email: 'testuser@example.com', profile_picture_url: 'https://i.pravatar.cc/150?u=testuser' },
  '2': { id: 2, full_name: 'Alice Johnson', email: 'alice@example.com', profile_picture_url: 'https://i.pravatar.cc/150?u=alice' },
  '3': { id: 3, full_name: 'Bob Williams', email: 'bob@example.com', profile_picture_url: 'https://i.pravatar.cc/150?u=bob' },
};

const mockMessages: Record<string, Message[]> = {
  '101': [
    { id: 1, sender_id: 2, recipient_id: 1, conversation_id: 101, content: 'Hey! How are you?', created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), is_deleted: false, sender: mockUsers['2'] },
    { id: 2, sender_id: 1, recipient_id: 2, conversation_id: 101, content: 'I am good, thanks! How about you?', created_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(), is_deleted: false, sender: mockUsers['1'] },
  ],
  '102': [
    { id: 3, sender_id: 3, recipient_id: 1, conversation_id: 102, content: 'Hi there, wanted to discuss the project.', created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(), is_deleted: false, sender: mockUsers['3'] },
  ],
};

const mockConversations: Conversation[] = [
  {
    id: 101,
    participants: [mockUsers['1'], mockUsers['2']],
    other_user: mockUsers['2'],
    last_message: mockMessages['101'][1],
    unread_count: 0,
    messages: mockMessages['101'],
    isLoadingMessages: false,
    hasMoreMessages: false,
    messagesFetched: true,
  },
  {
    id: 102,
    participants: [mockUsers['1'], mockUsers['3']],
    other_user: mockUsers['3'],
    last_message: mockMessages['102'][0],
    unread_count: 1,
    messages: mockMessages['102'],
    isLoadingMessages: false,
    hasMoreMessages: true,
    messagesFetched: true,
  },
];
// --- END MOCK DATA ---

function ChatPageContent() {
  const { 
    conversations, 
    setConversations, 
    activeConversationId, 
    setActiveConversationId,
    addMessage,
  } = useChatStore();
  const { user: currentUser, isLoading: isLoadingAuth } = useAuthStore();
  const searchParams = useSearchParams();

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  useEffect(() => {
    if (!isLoadingAuth && currentUser) {
      setConversations(mockConversations);
      const convIdStr = searchParams.get('conversationId');
      if (convIdStr) {
        setActiveConversationId(parseInt(convIdStr, 10));
      } else if (mockConversations.length > 0) {
        setActiveConversationId(mockConversations[0].id);
      }
    }
  }, [currentUser, isLoadingAuth, setConversations, setActiveConversationId, searchParams]);

  const handleSendMessage = (content: string) => {
    if (!currentUser || !activeConversationId) return;

    const newMessage: Message = {
      id: Date.now(),
      sender_id: currentUser.id,
      recipient_id: activeConversation?.other_user?.id || 0,
      conversation_id: activeConversationId,
      content,
      created_at: new Date().toISOString(),
      is_deleted: false,
      sender: mockUsers[currentUser.id.toString()],
    };
    addMessage(activeConversationId, newMessage);
  };

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert className="max-w-md">
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please log in to view your chats.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
        <ContactList />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        {activeConversation ? (
          <div className="flex flex-col h-full">
            <ChatHeader />
            <MessageArea />
            <MessageInput onSendMessage={handleSendMessage} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-semibold">Select a conversation</h2>
            <p className="text-muted-foreground">Choose from your existing conversations to start chatting.</p>
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ChatPageContent />
    </Suspense>
  );
}