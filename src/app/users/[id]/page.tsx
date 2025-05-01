'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { type UserProfile } from '@/types/user'; // Assuming type exists
import { type ConnectionStatusCheck, type Connection } from '@/types/connection'; // Import connection types
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, UserCheck, Check, X, Link2, Mail, Phone, Linkedin, MapPin, Briefcase, Sparkles, MessageSquare, CheckCircle } from "lucide-react"

type ButtonStatus = 'idle' | 'loading' | 'pending' | 'connected' | 'error';

const UserProfilePage = () => {
  const params = useParams();
  const profileUserId = params?.id ? parseInt(params.id as string, 10) : null;
  const token = useAuthStore((state) => state.token);
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = currentUser?.id;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusCheck | null>(null);
  const [buttonState, setButtonState] = useState<ButtonStatus>('idle');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = profileUserId === currentUserId;

  // --- Data Fetching ---
  const fetchProfile = useCallback(async () => {
    if (!profileUserId || !token) return;
    setIsLoadingProfile(true);
    setError(null);
    try {
      const response = await api.get<UserProfile>(`/users/${profileUserId}/profile`);
      setProfile(response.data);
    } catch (err: any) {
      console.error("Fetch profile error:", err);
      setError(err.response?.data?.detail || err.message || 'Failed to load profile.');
    } finally {
      setIsLoadingProfile(false);
    }
  }, [profileUserId, token]);

  const fetchConnectionStatus = useCallback(async () => {
    if (!profileUserId || !token || isOwnProfile) {
        setIsLoadingStatus(false); // No need to fetch status for own profile
        return;
    }
    setIsLoadingStatus(true);
    try {
      const response = await api.get<ConnectionStatusCheck>(`/connections/status/${profileUserId}`);
      setConnectionStatus(response.data);
      // Set initial button state based on fetched status
      switch (response.data.status) {
          case 'connected': setButtonState('connected'); break;
          case 'pending_from_me':
          case 'pending_from_them': setButtonState('pending'); break;
          default: setButtonState('idle');
      }
    } catch (err: any) {
      console.error("Fetch connection status error:", err);
      // Don't block profile view for status error
      toast.error("Could not load connection status.");
      setButtonState('idle'); // Default to idle/connect on error
    } finally {
      setIsLoadingStatus(false);
    }
  }, [profileUserId, token, isOwnProfile]);

  useEffect(() => {
    fetchProfile();
    fetchConnectionStatus();
  }, [fetchProfile, fetchConnectionStatus]);

  // --- Action Handlers ---
   const handleConnect = async () => {
    if (!token || !profileUserId || isOwnProfile) return;
    setButtonState('loading');
    try {
      const response = await api.post<Connection>('/connections', { recipient_id: profileUserId });
      const result = response.data;
      if (result.status === 'pending' || result.status === 'accepted') {
        setButtonState(result.status === 'pending' ? 'pending' : 'connected');
        setConnectionStatus({ status: result.status === 'pending' ? 'pending_from_me' : 'connected', connection_id: result.id });
        toast.success(result.status === 'pending' ? 'Connection request sent!' : 'Already connected!');
      } else {
        setButtonState('error');
        toast.error('Connection request failed. Unexpected status received.');
      }
    } catch (error: any) {
      setButtonState('error');
      toast.error(`Connection failed: ${error.response?.data?.detail || 'Unknown error'}`);
    }
  };

  const handleAccept = async () => {
    if (!token || !connectionStatus?.connection_id) return;
    setButtonState('loading');
    try {
        await api.put<Connection>(`/connections/${connectionStatus.connection_id}/accept`);
        setButtonState('connected');
        setConnectionStatus({ status: 'connected', connection_id: connectionStatus.connection_id });
        toast.success("Connection accepted!");
        useAuthStore.getState().triggerConnectionUpdate();
    } catch (err: any) {
        setButtonState('error');
        toast.error(`Accept failed: ${err.response?.data?.detail || 'Unknown error'}`);
    }
  };

  const handleDecline = async () => {
     if (!token || !connectionStatus?.connection_id) return;
     setButtonState('loading');
     try {
         await api.put<Connection>(`/connections/${connectionStatus.connection_id}/decline`);
         setButtonState('idle'); // Treat declined as idle for button state
         setConnectionStatus({ status: 'declined', connection_id: connectionStatus.connection_id }); // Update local status
         toast.info("Connection declined.");
         useAuthStore.getState().triggerConnectionUpdate();
     } catch (err: any) {
         setButtonState('error');
         toast.error(`Decline failed: ${err.response?.data?.detail || 'Unknown error'}`);
     }
  };
  
  // --- Render Logic ---
  const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const renderConnectButton = () => {
    if (isOwnProfile || isLoadingStatus) return null;

    switch (buttonState) {
      case 'loading':
        return <Button disabled size="sm"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</Button>;
      case 'pending':
        if (connectionStatus?.status === 'pending_from_them') {
          return (
            <div className='flex gap-2'>
              <Button size="sm" onClick={handleAccept}><Check className="mr-1 h-4 w-4"/> Accept</Button>
              <Button size="sm" variant='outline' onClick={handleDecline}><X className="mr-1 h-4 w-4"/> Decline</Button>
            </div>
          );
        }
        return <Button disabled variant="outline" size="sm"><Check className="mr-2 h-4 w-4" /> Request Sent</Button>;
      case 'connected':
        // TODO: Add Chat Button link later
        return <Button disabled variant="secondary" size="sm"><CheckCircle className="mr-2 h-4 w-4" /> Connected</Button>;
      case 'error': // Offer retry
        return <Button onClick={handleConnect} size="sm"><UserCheck className="mr-2 h-4 w-4" /> Connect</Button>;
      case 'idle':
      default:
        return <Button onClick={handleConnect} size="sm"><UserCheck className="mr-2 h-4 w-4" /> Connect</Button>;
    }
  };

  if (isLoadingProfile) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto py-8 px-4 md:px-6"><Skeleton className="h-64 w-full max-w-3xl mx-auto" /></div>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto py-8 px-4 md:px-6">
          <Alert variant="destructive" className="max-w-3xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!profile) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto py-8 px-4 md:px-6 text-center"><p>Profile not found.</p></div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar className="h-24 w-24 border text-4xl">
              <AvatarImage src={profile.profile_picture_signed_url || undefined} alt={profile.full_name || 'User profile'} />
              <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 mt-2 sm:mt-0">
              <div className="flex justify-between items-start">
                 <div>
                     <CardTitle className="text-2xl mb-1">{profile.full_name || `User ${profile.user_id}`}</CardTitle>
                     <CardDescription className="text-lg">{profile.title || 'No title specified'}</CardDescription>
                 </div>
                 <div className="mt-1">
                    {renderConnectButton()}
                 </div>
              </div>
               {/* Placeholder for Company/Startup link */} 
               {/* <p className="text-sm text-muted-foreground mt-2">Works at Company/Startup</p> */} 
            </div>
          </CardHeader>
          <CardContent className="space-y-6 mt-4">
            {profile.bio && (
              <div>
                <h3 className="font-semibold mb-1 text-sm uppercase text-muted-foreground">About</h3>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            {/* Skills & Expertise */}
            {profile.skills_expertise && profile.skills_expertise.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills_expertise.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Industry Focus */} 
             {profile.industry_focus && profile.industry_focus.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">Industry Focus</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.industry_focus.map((industry, index) => (
                    <Badge key={index} variant="outline">{industry}</Badge>
                  ))}
                </div>
              </div>
            )}

             {/* Project Interests / Goals */} 
             {profile.project_interests_goals && (
                 <div>
                     <h3 className="font-semibold mb-1 text-sm uppercase text-muted-foreground">Project Interests / Goals</h3>
                     <p className="text-sm text-foreground/80 whitespace-pre-wrap">{profile.project_interests_goals}</p>
                 </div>
             )}

             {/* Collaboration Prefs */} 
             {profile.collaboration_preferences && profile.collaboration_preferences.length > 0 && (
                 <div>
                     <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">Collaboration Preferences</h3>
                     <div className="flex flex-wrap gap-2">
                         {profile.collaboration_preferences.map((pref, index) => (
                             <Badge key={index} variant="outline">{pref}</Badge>
                         ))}
                     </div>
                 </div>
             )}

             {/* Tools/Tech */} 
             {profile.tools_technologies && profile.tools_technologies.length > 0 && (
                 <div>
                     <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">Tools & Technologies</h3>
                     <div className="flex flex-wrap gap-2">
                         {profile.tools_technologies.map((tool, index) => (
                             <Badge key={index} variant="outline">{tool}</Badge>
                         ))}
                     </div>
                 </div>
             )}

            {/* Contact Info (Respect Privacy - Example: Show only if connected) */} 
            {/* {(isOwnProfile || buttonState === 'connected') && profile.linkedin_profile_url && ( */}
            {profile.linkedin_profile_url && (
                 <div>
                     <h3 className="font-semibold mb-1 text-sm uppercase text-muted-foreground">Links</h3>
                     <a href={profile.linkedin_profile_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:underline">
                         <Linkedin className="h-4 w-4 mr-1" /> LinkedIn Profile
                     </a>
                 </div>
             )}
            {/* Add other contact info fields here based on privacy rules */}

          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
};

export default UserProfilePage; 