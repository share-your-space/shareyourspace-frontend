'use client';

import React from 'react';
import { useChatStore } from '@/store/chatStore';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserX } from "lucide-react";

export function ContactList() {
  const { conversations, setActiveConversationId, activeConversationId } = useChatStore();

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4 text-center">
        <UserX className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-sm font-medium">No Conversations</p>
        <p className="text-xs text-muted-foreground">
          You can start a chat from a user's profile or by getting matched.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold p-4">Conversations</h2>
      <div className="space-y-1 p-2">
        {conversations.map((conv) => {
          const otherUser = conv.other_user;
          if (!otherUser) return null;

          return (
            <button
              key={conv.id}
              className={cn(
                "flex items-center gap-3 p-2 w-full text-left rounded-lg transition-colors",
                activeConversationId === conv.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
              onClick={() => setActiveConversationId(conv.id)}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser.profile_picture_url} alt={otherUser.full_name} />
                <AvatarFallback>{otherUser.full_name?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 truncate">
                <div className="font-semibold">{otherUser.full_name}
                  {conv.is_external && <Badge variant="outline" className="ml-2 text-blue-500 border-blue-500">External</Badge>}
                </div>
                <p className={cn("text-xs truncate", activeConversationId === conv.id ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {conv.last_message ? conv.last_message.content : 'No messages yet...'}
                </p>
              </div>
              {conv.unread_count > 0 && (
                <Badge className="h-5 w-5 flex items-center justify-center p-0">{conv.unread_count}</Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
} 