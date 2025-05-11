'use client';

import React, { useState, useEffect } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'; // Assuming this handles auth check
import { ContactList } from '@/components/chat/ContactList';
import { MessageArea } from '@/components/chat/MessageArea';
import { MessageInput } from '@/components/chat/MessageInput';

// Placeholder types - replace with actual types/interfaces later
interface User {
  id: number;
  full_name: string;
  email: string;
  profile_picture_url?: string;
  role?: string;
}

type ChatMessageData = { id: number; sender_id: number; recipient_id: number; content: string; created_at: string; sender: User; recipient: User };

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    // Messages will be fetched by MessageArea component
  };

  return (
    <AuthenticatedLayout>
      <div className="flex h-[calc(100vh-var(--header-height))] border"> {/* Adjust height based on your layout header */} 
        <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
          {/* Column 1: Contact List */}
          <ResizablePanel defaultSize={25} maxSize={30} minSize={20}>
            <div className="flex h-full items-center justify-center p-2">
              <ContactList onSelectUser={handleSelectUser} selectedUser={selectedUser} /> {/* Pass selectedUser */} 
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          {/* Column 2 & 3: Message Area & Input */}
          <ResizablePanel defaultSize={75}>
            <div className="flex flex-col h-full">
              {/* Message Area */} 
              <div className="flex-grow overflow-y-auto">
                <MessageArea selectedUser={selectedUser} />
              </div>
              {/* Input Area */} 
              <div className="p-4 border-t">
                <MessageInput selectedUser={selectedUser} /> {/* Remove onSendMessage prop */} 
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </AuthenticatedLayout>
  );
} 