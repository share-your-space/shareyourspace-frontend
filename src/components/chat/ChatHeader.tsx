'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useChatStore } from '@/store/chatStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import { Button } from '../ui/button';

const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

const ChatHeader = () => {
    const { conversations, activeConversationId, onlineUserIds } = useChatStore();
    const [isTyping, setIsTyping] = useState(false);
    
    const activeConversation = useMemo(() => 
        conversations.find(c => c.id === activeConversationId),
        [conversations, activeConversationId]
    );

    const otherUser = useMemo(() => {
        if (!activeConversation) return null;
        // This logic needs to be adapted based on how `other_user` is structured in your mock data
        // Assuming participants array and a currentUser from another store
        // const currentUser = useAuthStore.getState().user;
        // return activeConversation.participants.find(p => p.id !== currentUser?.id);
        return activeConversation.participants[1]; // Simplified for mock
    }, [activeConversation]);


    useEffect(() => {
        // Mock typing indicator
        let typingInterval: NodeJS.Timeout;
        if (otherUser) {
            typingInterval = setInterval(() => {
                setIsTyping(Math.random() > 0.7); // Randomly simulate typing
            }, 2000);
        }
        return () => {
            clearInterval(typingInterval);
            setIsTyping(false);
        }
    }, [otherUser]);

    if (!otherUser) {
        return (
            <div className="p-3 border-b flex items-center justify-between h-[73px]">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            </div>
        );
    }

    const isOnline = otherUser ? onlineUserIds.has(otherUser.id) : false;

    return (
        <div className="p-3 border-b flex items-center justify-between h-[73px]">
            <Link href={`/users/${otherUser.id}`} className="flex items-center gap-3 hover:bg-accent p-2 rounded-lg -m-2">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={otherUser.profile_picture_url || undefined} alt={otherUser.full_name || 'User'} />
                    <AvatarFallback>{getInitials(otherUser.full_name)}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="font-semibold text-base">{otherUser.full_name}</h2>
                    <p className="text-xs text-muted-foreground h-4">
                        {isTyping ? <span className="italic text-primary">typing...</span> : (isOnline ? 'Online' : 'Offline')}
                    </p>
                </div>
            </Link>
            <div>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};

export default ChatHeader;
