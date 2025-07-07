'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { ContactList } from '@/components/chat/ContactList';
import { MessageArea } from '@/components/chat/MessageArea';
import { MessageInput } from '@/components/chat/MessageInput';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { Conversation } from '@/types/chat';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Lock, MessageSquare } from "lucide-react";
import Link from 'next/link';

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

        const response = await api.get<Conversation>(`/chat/conversations/with/${otherUserId}`);
        if (isMounted) {
          const newConversation = response.data;
          addOrUpdateConversation(newConversation, currentUser?.id);
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
          try {
            const response = await api.get<Conversation>(`/chat/conversations/${convId}`);
            if (isMounted) {
              addOrUpdateConversation(response.data, currentUser?.id);
              setActiveConversationId(convId);
            }
          } catch (error) {
            console.error("Failed to fetch specific conversation:", error);
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
  }, [searchParams, router, setActiveConversationId, addOrUpdateConversation]);


  if (isLoadingAuth) {
    return (
        <div className="flex h-[calc(100vh-var(--header-height))] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }

  if (currentUser?.status === 'WAITLISTED' && conversations.length === 0) {
    return (
        <div className="container mx-auto py-8 px-4 md:px-6 flex flex-col items-center justify-center h-[calc(100vh-var(--header-height))]">
            <Alert variant="default" className="border-orange-500 max-w-lg">
                <Lock className="h-5 w-5 text-orange-600" />
                <AlertTitle className="text-orange-700 mt-[-2px]">Feature Locked: Chat</AlertTitle>
                <AlertDescription className="text-muted-foreground mt-2">
                    You can only chat with Space Admins who have contacted you.
                    Full chat features will be available once you are accepted into a space.
                    <br />
                    Please check your <Link href="/dashboard" className="text-primary hover:underline">dashboard</Link> for status updates.
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
      <div className="flex h-[calc(100vh-var(--header-height))] border">
        <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
          <ResizablePanel defaultSize={25} maxSize={30} minSize={20}>
            <div className="flex h-full items-center justify-center p-2">
              <ContactList />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75}>
            {activeConversation ? (
                <div className="flex flex-col h-full">
                    <div className="flex-grow overflow-y-auto">
                        <MessageArea />
                    </div>
                    <div className="border-t bg-background">
                        <MessageInput />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col h-full items-center justify-center text-center text-muted-foreground bg-muted/20">
                    <MessageSquare className="h-12 w-12 mb-4" />
                    <h2 className="text-xl font-semibold">Select a conversation</h2>
                    <p className="text-sm">Choose a contact from the list to start chatting.</p>
                </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
  );
}

export default function ChatPage() {
    return (
        <AuthenticatedLayout>
            <Suspense fallback={
                <div className="flex h-[calc(100vh-var(--header-height))] items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            }>
                <ChatPageContent />
            </Suspense>
        </AuthenticatedLayout>
    )
} 