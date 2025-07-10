'use client';

import React, { useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { UserX, Search } from "lucide-react";

const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

export function ContactList() {
  const { conversations, setActiveConversationId, activeConversationId } = useChatStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conv => 
    conv.other_user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold tracking-tight">Chats</h2>
        <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search contacts..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 p-2">
        {filteredConversations.length === 0 ? (
            <div className="flex flex-col h-full items-center justify-center p-4 text-center text-muted-foreground">
                <UserX className="h-10 w-10 mb-4" />
                <p className="text-sm font-medium">No Conversations Found</p>
                <p className="text-xs">
                    {searchTerm ? 'Try a different search term.' : "You can start a chat from a user's profile."}
                </p>
            </div>
        ) : (
            filteredConversations.map((conv) => {
            const otherUser = conv.other_user;
            if (!otherUser) return null;

            return (
                <button
                key={conv.id}
                className={cn(
                    "flex items-center gap-3 p-2 w-full text-left rounded-lg transition-colors",
                    activeConversationId === conv.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
                onClick={() => setActiveConversationId(conv.id)}
                >
                <Avatar className="h-10 w-10 border-2 border-background">
                    <AvatarImage src={otherUser.profile_picture_url || undefined} alt={otherUser.full_name || 'User'} />
                    <AvatarFallback>{getInitials(otherUser.full_name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">{otherUser.full_name}</span>
                        {conv.unread_count > 0 && (
                            <Badge className="h-5 w-5 flex items-center justify-center p-0">{conv.unread_count}</Badge>
                        )}
                    </div>
                    <p className={cn("text-xs truncate", activeConversationId === conv.id ? "text-primary-foreground/80" : "text-muted-foreground")}>
                    {conv.last_message ? conv.last_message.content : 'No messages yet...'}
                    </p>
                </div>
                </button>
            );
            })
        )}
      </div>
    </div>
  );
}