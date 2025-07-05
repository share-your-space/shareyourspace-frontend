'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import AuthGuard from "@/components/layout/AuthGuard";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, ArrowLeft, UserCheck, Check, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { type Connection, type ConnectionStatusCheck } from '@/types/connection';
import { UserDetail } from '@/types/auth';
import { getUserDetailedProfile } from '@/lib/api/users';
import UserProfileDisplay from '@/components/profile/UserProfileDisplay';
import { Separator } from '@/components/ui/separator';

type ConnectButtonStatus = 'idle' | 'loading' | 'pending' | 'connected' | 'error';

const UserProfilePage = () => {
  const params = useParams();
    const router = useRouter();
    const userId = params.id as string; // User ID from route

    const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<ConnectButtonStatus>('idle');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentUser = useAuthStore(state => state.user);

    useEffect(() => {
        if (userId) {
            const fetchProfileAndStatus = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const numericUserId = parseInt(userId, 10);
                    if (isNaN(numericUserId)) {
                        setError("Invalid user ID.");
                        return;
                    }
                    const data = await getUserDetailedProfile(numericUserId);
                    setUserDetail(data);

                    // Fetch connection status with this user
                    if (currentUser && currentUser.id !== numericUserId) { // Don't fetch for own profile
                      try {
                            const statusResponse = await api.get<ConnectionStatusCheck>(`/connections/status/${userId}`);
                            const status = statusResponse.data.status;
                            if (status === 'connected') setConnectionStatus('connected');
                            else if (status === 'pending_from_me' || status === 'pending_from_them') setConnectionStatus('pending');
                            else setConnectionStatus('idle');
                        } catch (statusErr) {
                            console.warn("Failed to fetch connection status for profile page:", statusErr);
                            setConnectionStatus('idle'); // Default to idle if status check fails
                        }
                    }

                } catch (err: any) {
                    console.error("Error fetching user profile:", err);
                    setError(err.response?.data?.detail || "User profile not found or an error occurred.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchProfileAndStatus();
        }
    }, [userId, currentUser]);

    const handleConnect = async () => {
        if (!userDetail) return;
        setConnectionStatus('loading');
        try {
            const response = await api.post<Connection>('/connections', { recipient_id: userDetail.id });
            if (response.data.status === 'pending') {
                setConnectionStatus('pending');
                toast.success('Connection request sent!');
            } else if (response.data.status === 'accepted') {
                setConnectionStatus('connected');
                toast.success('Connected successfully (already connected)!');
            } else {
                throw new Error('Unexpected connection status from API');
            }
        } catch (err: any) {
            setConnectionStatus('error');
            toast.error(err.response?.data?.detail || 'Failed to send connection request.');
    }
  };

  const handleMessage = () => {
    if (!userDetail) return;
    router.push(`/chat?userId=${userDetail.id}`);
  };

    if (isLoading) {
    return (
      <AuthenticatedLayout>
                <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
      </AuthenticatedLayout>
    );
  }

    if (error || !userDetail) {
    return (
      <AuthenticatedLayout>
                <div className="container mx-auto py-8 px-4 text-center">
                    <Alert variant="destructive" className="max-w-lg mx-auto">
                        <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error || "Profile could not be loaded."}</AlertDescription>
          </Alert>
                    <Button onClick={() => router.back()} variant="outline" className="mt-6">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
        </div>
      </AuthenticatedLayout>
    );
  }

    const isOwnProfile = currentUser?.id === userDetail.id;
    const canConnect = 
        !isOwnProfile &&
        currentUser?.status === 'ACTIVE' && 
        userDetail.space_id !== null &&
        currentUser?.space_id === userDetail.space_id;

    let connectButtonRender;
    if (canConnect) {
        switch (connectionStatus) {
            case 'loading':
                connectButtonRender = <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</Button>;
                break;
            case 'pending':
                connectButtonRender = <Button disabled variant="outline"><Check className="mr-2 h-4 w-4" /> Request Sent</Button>;
                break;
            case 'connected':
                connectButtonRender = (
                    <Button onClick={handleMessage}>
                        <MessageSquare className="mr-2 h-4 w-4" /> Message
                    </Button>
                );
                break;
            case 'error': // Offer retry
            case 'idle':
            default:
                connectButtonRender = <Button onClick={handleConnect}><UserCheck className="mr-2 h-4 w-4" /> Connect</Button>;
                break;
        }
  }

  return (
        <AuthGuard>
    <AuthenticatedLayout>
      <div className="container mx-auto py-8 px-4 md:px-6 max-w-4xl">
          <Button onClick={() => router.back()} variant="outline" size="sm" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <UserProfileDisplay userDetail={userDetail} />

          {connectButtonRender && (
              <div className="mt-6 text-center">
                  <Separator className="mb-6 max-w-sm mx-auto" />
                  {connectButtonRender}
              </div> 
          )}
      </div>
    </AuthenticatedLayout>
        </AuthGuard>
  );
};

export default UserProfilePage; 