'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, ArrowLeft, Check, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { UserDetail } from '@/types/auth';
import { UserProfile } from '@/types/userProfile';
import UserProfileDisplay from '@/components/profile/UserProfileDisplay';
import { Separator } from '@/components/ui/separator';
import { mockUsers } from '@/lib/mock-data';
import { toast } from 'sonner';
import { useChatStore } from '@/store/chatStore';

// Mock Data is now in lib/mock-data.ts

type ConnectButtonStatus = 'idle' | 'loading' | 'pending' | 'connected' | 'error';

const UserProfilePage = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectButtonStatus>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = useAuthStore(state => state.user);
  const { addOrUpdateConversation, setActiveConversationId } = useChatStore();


  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      const user = mockUsers.find(u => u.id.toString() === userId);
      if (user) {
        // The profile from mock data is partial, so we cast it to create a full UserDetail object.
        const partialProfile = user.profile as Partial<UserProfile>;
        const fullUserDetail: UserDetail = {
            ...user,
            profile: {
                id: user.id,
                user_id: user.id,
                ...partialProfile,
            } as UserProfile,
            company: null, // Add missing property
            interests: [], // Add missing property
        };
        setUserDetail(fullUserDetail);

        // Simulate checking connection status
        if (currentUser && currentUser.id.toString() !== userId) {
          // Let's pretend we have a connection with user '2'
          if (user.id === '2') {
            setConnectionStatus('connected');
          } else {
            setConnectionStatus('idle');
          }
        }
      } else {
        setError("User profile not found.");
      }
      setIsLoading(false);
    }, 500);
  }, [userId, currentUser]);

  const handleConnect = () => {
    if (!userDetail) return;
    setConnectionStatus('loading');
    setTimeout(() => {
      if (connectionStatus === 'idle') {
        setConnectionStatus('pending');
        toast.success('Connection Request Sent', { description: `Your request to connect with ${userDetail.full_name} has been sent.` });
      } else if (connectionStatus === 'pending' || connectionStatus === 'connected') {
        // Allow disconnecting
        setConnectionStatus('idle');
        toast.info('Disconnected', { description: `You have disconnected from ${userDetail.full_name}.` });
      }
    }, 500);
  };

  const handleMessage = () => {
    if (!userDetail || !currentUser) return;

    // Simulate creating a new conversation
    const otherUser = userDetail;
    const newConversationId = `conv_${currentUser.id}_${otherUser.id}_${Date.now()}`;

    const newConversation = {
      id: newConversationId,
      participants: [
        {
          id: currentUser.id,
          full_name: currentUser.full_name,
          profile_picture_url: currentUser.profile?.profile_picture_url || '',
        },
        {
          id: otherUser.id,
          full_name: otherUser.full_name,
          profile_picture_url: otherUser.profile?.profile_picture_url || '',
        },
      ],
      messages: [],
      unread_count: 0,
      last_message: null,
    };

    // @ts-expect-error - The type in chatStore might need adjustment, but this structure is correct
    addOrUpdateConversation(newConversation);
    setActiveConversationId(newConversation.id);

    toast.success('Chat Opened', {
      description: `You can now message ${userDetail.full_name}.`,
    });
    router.push(`/chat?conversationId=${newConversation.id}`);
  };

  const renderConnectButton = () => {
    if (!currentUser || !userDetail || currentUser.id === userDetail.id) {
      return null;
    }

    switch (connectionStatus) {
      case 'loading':
        return <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</Button>;
      case 'pending':
        return <Button variant="outline" onClick={handleConnect}><Check className="mr-2 h-4 w-4" /> Request Sent</Button>;
      case 'connected':
        return <Button variant="secondary" onClick={handleConnect}>Disconnect</Button>;
      case 'error':
        return <Button variant="destructive" onClick={handleConnect}>Error! Retry</Button>;
      default:
        return <Button onClick={handleConnect}>Connect</Button>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!userDetail) {
    return null; // Should be covered by error state
  }

  return (
      <div className="container mx-auto max-w-4xl p-4 md:p-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="flex-grow">
            <UserProfileDisplay userDetail={userDetail} />
          </div>
          <div className="w-full md:w-64 flex-shrink-0 space-y-4 mt-8 md:mt-0">
            {renderConnectButton()}
            {connectionStatus === 'connected' && (
              <Button onClick={handleMessage} className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" /> Message
              </Button>
            )}
          </div>
        </div>
        <Separator className="my-8" />
        <div>
          <h3 className="text-2xl font-bold mb-4">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {userDetail.interests?.map(interest => (
              <div key={interest.id} className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                {interest.name}
              </div>
            ))}
          </div>
        </div>
      </div>
  );
};

export default UserProfilePage;