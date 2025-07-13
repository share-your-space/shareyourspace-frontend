"use client";
import React, { useEffect, Suspense } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ContactList } from "@/components/chat/ContactList";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageArea from "@/components/chat/MessageArea";
import { MessageInput } from "@/components/chat/MessageInput";
import { useChatStore } from "@/store/chatStore";
import { mockConversations, mockUsers } from "@/lib/mock-data";
import { useAuthStore } from "@/store/authStore";
import { ChatMessageData } from "@/types/chat";
import { Loader2, MessageSquare } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function ChatPageContent() {
  const {
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversationId,
    addMessage,
  } = useChatStore();
  const { user: currentUser, isLoading: isLoadingAuth, setUser } = useAuthStore();

  useEffect(() => {
    // Set mock user and conversations on initial load
    if (!currentUser) {
      setUser(mockUsers.find((u) => u.id === "user-1")!); // Set a default user
    }
    if (conversations.length === 0) {
        setConversations(mockConversations);
    }
    if (!activeConversationId && mockConversations.length > 0) {
      setActiveConversationId(mockConversations[0].id);
    }
  }, [currentUser, setUser, setConversations, setActiveConversationId, activeConversationId, conversations]);

  const handleSendMessage = (content: string) => {
    if (!activeConversationId || !currentUser) return;
    const activeConversation = conversations.find((c) => c.id === activeConversationId);
    if (!activeConversation || !activeConversation.other_user) return;

    const newMessage: ChatMessageData = {
      id: `msg-${Date.now()}`,
      conversation_id: activeConversationId,
      sender_id: currentUser.id,
      recipient_id: activeConversation.other_user.id,
      content,
      created_at: new Date().toISOString(),
      is_deleted: false,
      sender: {
        id: currentUser.id,
        full_name: currentUser.full_name || "User",
        email: currentUser.email,
        profile_picture_url: currentUser.profile_picture_url || undefined,
        role: currentUser.role,
      },
      read_at: null,
      updated_at: null,
      attachment_url: null,
      attachment_filename: null,
      attachment_mimetype: null,
      reactions: [],
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
        <div className="flex flex-col h-full">
          {activeConversationId ? (
            <>
              <ChatHeader />
              <MessageArea />
              <MessageInput onSendMessage={handleSendMessage} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground" />
              <h2 className="mt-4 text-2xl font-semibold">Select a conversation</h2>
              <p className="text-muted-foreground">Choose from your existing conversations to start chatting.</p>
            </div>
          )}
        </div>
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