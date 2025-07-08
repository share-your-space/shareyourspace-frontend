'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { toast } from 'sonner';

import { Interest } from '@/types/space';
import { UserRole } from '@/types/enums';
import { acceptInterest, initiateExternalChat } from '@/lib/api/interests';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { ConversationData } from '@/types/chat';

interface InterestCardProps {
  interest: Interest;
  onInterestAccepted: () => void;
}

export default function InterestCard({ interest, onInterestAccepted }: InterestCardProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  const router = useRouter();
  const { addOrUpdateConversation, setActiveConversationId } = useChatStore();
  const currentUserId = useAuthStore((state) => state.user?.id);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await acceptInterest(interest.id);
      toast.success("Interest accepted!", {
        description: `${interest.user.full_name} has been added to your space.`,
      });
      onInterestAccepted();
    } catch (error) {
      toast.error("Failed to accept interest.");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleMessage = async () => {
    setIsMessaging(true);
    try {
      if (!currentUserId) {
        toast.error("Authentication error. Please wait and try again.");
        setIsMessaging(false);
        return;
      }
      const conversation = await initiateExternalChat(interest.user.id);
      addOrUpdateConversation(conversation, currentUserId);
      setActiveConversationId(conversation.id);
      toast.success("Chat initiated!", {
        description: `You can now message ${interest.user.full_name}.`
      });
      router.push(`/chat?conversationId=${conversation.id}`);
    } catch (error) {
      console.error("Failed to initiate chat:", error);
      toast.error("Failed to initiate chat.", {
        description: "The user may already be in a conversation or an error occurred."
      });
    } finally {
      setIsMessaging(false);
    }
  };

  const isStartup = interest.user.role === UserRole.STARTUP_ADMIN && interest.startup;

  const profileLink = isStartup ? `/startups/${interest.startup?.id}` : `/users/${interest.user.id}`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={(isStartup ? interest.startup?.logo_url : interest.user.profile?.profile_picture_url) || ''} alt="Profile" />
          <AvatarFallback>{isStartup ? interest.startup?.name[0] : interest.user.full_name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle>{isStartup ? interest.startup?.name : interest.user.full_name}</CardTitle>
          {isStartup && <CardDescription>Contact: {interest.user.full_name}</CardDescription>}
          <Badge variant="outline" className="mt-1">{interest.user.role}</Badge>
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
        <Button onClick={handleMessage} disabled={isMessaging}>
          {isMessaging ? 'Starting Chat...' : 'Message'}
        </Button>
        <Button onClick={handleAccept} disabled={isAccepting}>
          {isAccepting ? 'Adding...' : 'Add to Space'}
        </Button>
      </CardFooter>
    </Card>
  );
} 