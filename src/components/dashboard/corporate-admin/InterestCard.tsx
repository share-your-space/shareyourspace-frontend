'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Interest } from '@/types/interest';
import { UserRole } from '@/types/enums';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { Conversation } from '@/types/chat';

interface InterestCardProps {
  interest: Interest;
  onInterestAccepted: (interestId: string) => void;
}

export default function InterestCard({
  interest,
  onInterestAccepted,
}: InterestCardProps) {
  const router = useRouter();
  const { addOrUpdateConversation, setActiveConversationId } = useChatStore();
  const currentUser = useAuthStore((state) => state.user);

  const handleAccept = async () => {
    toast.success('Interest accepted!', {
      description: `${interest.user.full_name} has been added to your space.`,
    });
    onInterestAccepted(interest.id);
  };

  const handleMessage = async () => {
    if (!currentUser) {
      toast.error('Authentication error. Please log in.');
      return;
    }

    // Simulate creating a new conversation
    const otherUser = interest.user;
    const newConversationId = `conv_${currentUser.id}_${
      otherUser.id
    }_${Date.now()}`;

    const newConversation: Conversation = {
      id: newConversationId,
      participants: [currentUser, otherUser],
      messages: [],
      unread_count: 0,
      last_message: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isLoadingMessages: false,
      hasMoreMessages: false,
      messagesFetched: false,
    };

    addOrUpdateConversation(newConversation);
    setActiveConversationId(newConversation.id);

    toast.success('Chat initiated!', {
      description: `You can now message ${interest.user.full_name}.`,
    });
    router.push(`/chat?conversationId=${newConversation.id}`);
  };

  const isStartup =
    interest.user.role === UserRole.STARTUP_ADMIN && interest.startup;

  const profileLink = isStartup
    ? `/startups/${interest.startup?.id}`
    : `/users/${interest.user.id}`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <Avatar className="h-12 w-12">
          <AvatarImage
            src={
              (isStartup
                ? interest.startup?.profile_image_url
                : interest.user.profile?.profile_picture_url) || ''
            }
            alt="Profile"
          />
          <AvatarFallback>
            {isStartup
              ? interest.startup?.name[0]
              : interest.user.full_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle>
            {isStartup ? interest.startup?.name : interest.user.full_name}
          </CardTitle>
          {isStartup && (
            <CardDescription>
              Contact: {interest.user.full_name}
            </CardDescription>
          )}
          <Badge variant="outline" className="mt-1">
            {interest.user.role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {isStartup ? interest.startup?.mission : interest.user.profile?.bio}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Link href={profileLink} passHref>
          <Button variant="outline">View Profile</Button>
        </Link>
        <Button onClick={handleMessage}>Message</Button>
        <Button onClick={handleAccept}>Accept</Button>
      </CardFooter>
    </Card>
  );
}