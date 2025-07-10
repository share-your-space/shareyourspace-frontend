'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { ContactList } from '@/components/chat/ContactList';
import MessageArea from '@/components/chat/MessageArea';
import { MessageInput } from '@/components/chat/MessageInput';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { Conversation } from '@/types/chat';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Lock, MessageSquare } from "lucide-react";
import Link from 'next/link';
import ChatHeader from '@/components/chat/ChatHeader';

function ChatPageContent() {
  const { 
    conversations, 
    setConversations, 
    activeConversationId, 
    setActiveConversationId,
    addOrUpdateConversation
  } = useChatStore();
  const { user: currentUser, isLoading: isLoadingAuth } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Effect to fetch all initial conversations
  useEffect(() => {
    if (isLoadingAuth || !currentUser) return;
    
    let isMounted = true;

    const fetchInitialConversations = async () => {
      try {
        const response = await api.get<Conversation[]>('/chat/conversations');
        if (isMounted) {
            setConversations(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      }
    };

    fetchInitialConversations();

    return () => { isMounted = false; };
  }, [currentUser, isLoadingAuth, setConversations]);

  // Effect to handle conversation specified by userId or conversationId in URL
  useEffect(() => {
    const userIdStr = searchParams.get('userId');
    const convIdStr = searchParams.get('conversationId');
    let isMounted = true;

    const getOrCreateConversation = async (otherUserId: number) => {
      try {
        const { conversations: currentConversations, activeConversationId: currentActiveId } = useChatStore.getState();
        const existingConv = currentConversations.find(c => c.other_user && c.other_user.id === otherUserId);

        if (existingConv) {
          if (currentActiveId !== existingConv.id) {
            setActiveConversationId(existingConv.id);
          }
          if (userIdStr) { // Only replace URL if we came from a userId url
            router.replace(`/chat?conversationId=${existingConv.id}`, { scroll: false });
          }
          return;
        }

        if (!currentUser?.id) return; // Prevent calling with undefined user

        const response = await api.get<Conversation>(`/chat/conversations/with/${otherUserId}`);
        if (isMounted) {
          const newConversation = response.data;
          addOrUpdateConversation(newConversation, currentUser.id);
          setActiveConversationId(newConversation.id);
          router.replace(`/chat?conversationId=${newConversation.id}`, { scroll: false });
        }
      } catch (error) {
        console.error("Failed to get or create conversation:", error);
      }
    };

    const handleUrlConversation = async (convId: number) => {
      const { activeConversationId: currentActiveId, conversations: currentConversations } = useChatStore.getState();
      if (convId !== currentActiveId) {
        const existingConv = currentConversations.find(c => c.id === convId);
        if (existingConv) {
          setActiveConversationId(convId);
        } else {
          if (!currentUser?.id) return; // Prevent calling with undefined user
          try {
            const response = await api.get<Conversation>(`/chat/conversations/${convId}`);
            if (isMounted) {
              addOrUpdateConversation(response.data, currentUser.id);
              setActiveConversationId(convId);
            }
          } catch (error) {
            console.error("Failed to fetch conversation by ID:", error);
          }
        }
      }
    };

    if (userIdStr) {
      const userId = parseInt(userIdStr, 10);
      if (!isNaN(userId)) {
        getOrCreateConversation(userId);
      }
    } else if (convIdStr) {
      const convId = parseInt(convIdStr, 10);
      if (!isNaN(convId)) {
        handleUrlConversation(convId);
      }
    }
    
    return () => { isMounted = false; };
  }, [searchParams, currentUser, addOrUpdateConversation, setActiveConversationId, router]);

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
        <Alert variant="destructive" className="max-w-md">
          <Lock className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You must be logged in to access the chat. Please <Link href="/login" className="font-bold hover:underline">log in</Link>.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
        <div className="flex flex-col h-full">
          <ContactList />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        <div className="flex flex-col h-full">
          {activeConversation ? (
            <>
              <ChatHeader user={activeConversation.other_user} />
              <MessageArea />
              <MessageInput />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold">Select a Conversation</h2>
              <p className="text-muted-foreground">Choose a contact from the list to start chatting.</p>
            </div>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default function ChatPage() {
  return (
    <AuthenticatedLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <ChatPageContent />
      </Suspense>
    </AuthenticatedLayout>
  );
}