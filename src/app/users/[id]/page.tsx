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

// Mock Data
const mockUsers: { [key: string]: UserDetail } = {
  '1': {
    id: 1,
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'FREELANCER',
    status: 'ACTIVE',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile: {
      headline: 'Senior Frontend Developer',
      bio: 'Passionate about creating beautiful and intuitive user interfaces. 10+ years of experience in React, Next.js, and TypeScript.',
      skills_expertise: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js'],
      linkedin_profile_url: 'https://linkedin.com/in/johndoe',
      website_url: 'https://johndoe.dev',
      profile_picture_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop',
    },
    company: null,
    interests: [{ id: 1, name: 'Web Development' }, { id: 2, name: 'UI/UX Design' }],
  },
  '2': {
    id: 2,
    full_name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'STARTUP_ADMIN',
    status: 'ACTIVE',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile: {
      headline: 'Founder & CEO at Innovate Inc.',
      bio: 'Building the future of SaaS. Looking for talented individuals to join our team.',
      skills_expertise: ['Leadership', 'Product Management', 'SaaS', 'Fundraising'],
      linkedin_profile_url: 'https://linkedin.com/in/janesmith',
      website_url: 'https://innovateinc.com',
      profile_picture_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop',
    },
    company: { id: 1, name: 'Innovate Inc.', description: 'A cutting-edge SaaS company.' },
    interests: [{ id: 3, name: 'Startups' }, { id: 4, name: 'Venture Capital' }],
  },
};

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

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      const user = mockUsers[userId];
      if (user) {
        // The profile from mock data is partial, so we cast it to create a full UserDetail object.
        const partialProfile = user.profile as Partial<UserProfile>;
        const fullUserDetail: UserDetail = {
            ...user,
            profile: {
                id: user.id,
                user_id: user.id,
                ...partialProfile,
            } as UserProfile
        };
        setUserDetail(fullUserDetail);

        // Simulate checking connection status
        if (currentUser && currentUser.id !== user.id) {
          // Let's pretend we have a connection with user 2
          if (user.id === 2) {
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
      } else if (connectionStatus === 'pending' || connectionStatus === 'connected') {
        // Allow disconnecting
        setConnectionStatus('idle');
      }
    }, 500);
  };

  const handleMessage = () => {
    if (!userDetail) return;
    router.push(`/chat?userId=${userDetail.id}`);
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
          <div className="w-full md:w-64 flex-shrink-0 space-y-4">
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