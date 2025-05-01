'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { MatchCard } from '@/components/discover/MatchCard';
import { useAuthStore } from '@/store/authStore';
import { api } from "@/lib/api"; // Import the api client
import { type MatchResult } from '@/types/matching';
import { type ConnectionStatusCheck } from '@/types/connection'; // Import ConnectionStatusCheck type
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertTriangle, Info } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Type for the status map
type StatusMap = Record<number, ConnectionStatusCheck>;

export default function DiscoverPage() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [connectionStatuses, setConnectionStatuses] = useState<StatusMap>({}); // State for statuses
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
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
        // 1. Fetch Matches
        const matchesResponse = await api.get<MatchResult[]>('/matching/discover');
        const fetchedMatches = matchesResponse.data;
        setMatches(fetchedMatches);

        // 2. Fetch Connection Statuses if matches exist
        if (fetchedMatches && fetchedMatches.length > 0) {
          const userIds = fetchedMatches.map(m => m.profile.user_id);
          
          // Construct query parameters correctly for a list
          const params = new URLSearchParams();
          userIds.forEach(id => params.append('user_id', id.toString()));

          try {
            const statusesResponse = await api.get<StatusMap>(
              `/connections/status-batch?${params.toString()}`
            );
            setConnectionStatuses(statusesResponse.data);
          } catch (statusError: any) {
            console.error("Fetch connection statuses error:", statusError);
            // Don't block UI for status errors, just log and maybe show partial info
            setError("Could not load connection statuses for all matches. Proceeding with available data."); 
          }
        }
      } catch (err: any) {
        console.error("Fetch matches error:", err);
        setError(err.response?.data?.detail || err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatchesAndStatuses();
  }, [token]);

  // Convert backend status string to MatchCard prop type
  const getInitialStatus = (userId: number): 'idle' | 'pending' | 'connected' => {
    const statusInfo = connectionStatuses[userId];
    if (!statusInfo) return 'idle';
    
    switch (statusInfo.status) {
        case 'connected':
            return 'connected';
        case 'pending_from_me':
        case 'pending_from_them':
            return 'pending';
        case 'not_connected':
        case 'declined': // Treat declined as idle for the button
        default:
            return 'idle';
    }
  };

  const renderContent = () => {
    if (isLoading) {
      // Display skeleton loaders
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-[350px] w-full" />
          ))}
        </div>
      );
    }

    if (error && !matches.length) { // Only show critical error if no matches loaded
      return (
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
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
             <Alert variant="warning" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match, index) => (
            <MatchCard 
              key={match.profile.user_id || index} 
              match={match} 
              initialConnectionStatus={getInitialStatus(match.profile.user_id)}
            />
          ))}
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