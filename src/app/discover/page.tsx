'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { MatchCard } from '@/components/discover/MatchCard';
import { useAuthStore } from '@/store/authStore';
// import { getPotentialMatches, checkConnectionStatus, ConnectionStatusCheck } from "@/lib/api";
import { api } from "@/lib/api"; // Import the api client
import { type MatchResult } from '@/types/matching';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertTriangle, Info, Lock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from 'next/link'; // Import Link
import { Button } from '@/components/ui/button'; // Import Button

// Type for the status map
// type StatusMap = Record<number, ConnectionStatusCheck>;
type StatusMap = Record<number, any>; // Use 'any' as a temporary measure

export default function DiscoverPage() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [connectionStatuses, setConnectionStatuses] = useState<StatusMap>({}); // State for statuses
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user); // Get user from store
  const token = useAuthStore((state) => state.token); // Token is still needed for API calls for non-waitlisted
  const isLoadingAuth = useAuthStore((state) => state.isLoading); // Get auth loading state

  useEffect(() => {
    // Wait for auth state to load and user to be defined
    if (isLoadingAuth) {
      return; // Don't do anything if auth is still loading
    }

    // If user is waitlisted, don't fetch matches
    if (user?.status === 'WAITLISTED') {
      setIsLoading(false); // Not loading matches
      return;
    }

    // Proceed to fetch matches if user is not waitlisted and authenticated
    const fetchMatchesAndStatuses = async () => {
      setIsLoading(true);
      setError(null);
      setMatches([]);
      setConnectionStatuses({});

      if (!token) {
        setError('Authentication required. Please log in.');
        setIsLoading(false);
        return;
      }

      try {
        // const matchesResponse = await api.get<MatchResult[]>('/matching/discover');
        // const fetchedMatches = matchesResponse.data;
        const fetchedMatches: MatchResult[] = []; // Temp: return empty array
        
        // Check for a profile completion message from the backend
        if (fetchedMatches.length > 0 && (fetchedMatches[0] as any).message) {
            setError((fetchedMatches[0] as any).message);
            setMatches([]); // Clear any potential stale matches
        } else {
        setMatches(fetchedMatches);
        if (fetchedMatches && fetchedMatches.length > 0) {
              const userIds = fetchedMatches.filter(m => m.profile).map(m => m.profile!.user_id);
              if (userIds.length > 0) {
          const params = new URLSearchParams();
          userIds.forEach(id => params.append('user_id', id.toString()));

          // try {
          //   const statusesResponse = await api.get<StatusMap>(
          //     `/connections/status-batch?${params.toString()}`
          //   );
          //   setConnectionStatuses(statusesResponse.data);
          // } catch (statusError: any) {
          //   console.error("Fetch connection statuses error:", statusError);
          //         // Non-critical error, we can still display matches
          //       }
              }
          }
        }

      } catch (err: any) {
        console.error("Fetch matches error:", err);
        setError(err.response?.data?.detail || err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    if (token && user && user.status !== 'WAITLISTED') { // Ensure user is defined and not waitlisted
      fetchMatchesAndStatuses();
    } else if (!token && !isLoadingAuth) { // If no token and auth isn't loading, set error or let AuthGuard handle
      setError('Authentication required. Please log in.');
      setIsLoading(false);
    }
  }, [token, user, isLoadingAuth]); // Depend on user and isLoadingAuth

  // Convert backend status string to MatchCard prop type
  const getInitialStatus = (userId: number): 'idle' | 'pending' | 'connected' => {
    const statusInfo = connectionStatuses[userId];
    if (!statusInfo) return 'idle';
    
    // switch (statusInfo.status) {
    //     case 'connected':
    //         return 'connected';
    //     case 'pending_from_me':
    //     case 'pending_from_them':
    //         return 'pending';
    //     case 'not_connected':
    //     case 'declined': // Treat declined as idle for the button
    //     default:
    //         return 'idle';
    // }
    return 'idle';
  };

  const renderContent = () => {
    if (isLoadingAuth || (isLoading && user?.status !== 'WAITLISTED')) { // Show skeletons if auth loading OR loading matches for non-waitlisted
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-[350px] w-full" />
          ))}
        </div>
      );
    }

    // Handle waitlisted user state first
    if (user?.status === 'WAITLISTED') {
      return (
        <Alert variant="default" className="border-orange-500">
          <Lock className="h-5 w-5 text-orange-600" />
          <AlertTitle className="text-orange-700">Feature Locked: Discover Connections</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            This feature will become available once you are actively assigned to a space.
            Being part of a space allows you to discover and connect with other members within your community.
            <br />
            In the meantime, completing your profile will improve your visibility once you join a space.
          </AlertDescription>
          <div className="mt-4 flex items-center gap-x-4">
            <Button asChild>
              <Link href="/dashboard/profile/edit">Complete Your Profile</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </Alert>
      );
    }

    // Handle case where user is not in a space
    if (!user?.space_id) {
        return (
            <Alert>
                <Info className="h-5 w-5" />
                <AlertTitle>Start Your Journey!</AlertTitle>
                <AlertDescription>
                    The Discover feature is where you'll find other members inside your workspace.
                    Since you're not part of a space yet, your next step is to explore potential spaces or get invited by a Corporate Admin.
                    <br /><br />
                    Keep your <Link href="/dashboard/profile/edit" className="text-primary hover:underline">profile</Link> updated to increase your chances of being discovered!
                </AlertDescription>
            </Alert>
        );
    }

    // Existing logic for non-waitlisted users
    if (error && !matches.length) {
      return (
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Complete Your Profile to Discover Others</AlertTitle>
            <AlertDescription>
                {error}
                <div className="mt-4">
                    <Button asChild>
                        <Link href="/dashboard/profile/edit">Go to Profile</Link>
                    </Button>
                </div>
            </AlertDescription>
        </Alert>
      );
    }

    if (!isLoading && matches.length === 0) {
      return (
         <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Matches Found</AlertTitle>
            <AlertDescription>
              We couldn't find any potential matches for you right now. Try updating your profile with more details!
            </AlertDescription>
        </Alert>
      );
    }

    // Render matches, potentially with a non-critical error message above
    return (
      <>
        {error && matches.length > 0 && ( // Show non-critical error (e.g., status fetch failure) above list
             <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match, index) => 
            match.profile ? (
            <MatchCard 
              key={match.profile.user_id || index} 
              match={match} 
              initialConnectionStatus={getInitialStatus(match.profile.user_id)}
            />
            ) : null
          )}
        </div>
      </>
    );
  };

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Discover Connections</h1>
        {renderContent()}
      </div>
    </AuthenticatedLayout>
  );
} 