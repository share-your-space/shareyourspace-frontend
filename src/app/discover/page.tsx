'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MatchCard } from '@/components/discover/MatchCard';
import { useAuthStore } from '@/store/authStore';
import { api } from "@/lib/api"; 
import { type MatchResult } from '@/types/matching';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Info, Lock, Search, X, SlidersHorizontal } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterSheet } from '@/components/discover/FilterSheet';

type ConnectionStatusValue = 'connected' | 'pending_from_me' | 'pending_from_them' | 'not_connected' | 'declined';
type ConnectionStatusCheck = {
  status: ConnectionStatusValue;
};
type StatusMap = Record<number, ConnectionStatusCheck>;
type MatchApiResponse = MatchResult[] | { message: string };

interface ApiError {
    response?: {
        data?: {
            detail?: string;
        };
    };
}

export default function DiscoverPage() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [connectionStatuses, setConnectionStatuses] = useState<StatusMap>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isLoadingAuth = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (isLoadingAuth) {
      return;
    }

    if (user?.status === 'WAITLISTED') {
      setIsLoading(false);
      return;
    }

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
        const matchesResponse = await api.get<MatchApiResponse>('/matching/discover');
        const fetchedData = matchesResponse.data;
        
        if (Array.isArray(fetchedData)) {
            setMatches(fetchedData);
            if (fetchedData.length > 0) {
                const userIds = fetchedData.filter(m => m.profile).map(m => m.profile!.user_id);
                if (userIds.length > 0) {
                    const params = new URLSearchParams();
                    userIds.forEach(id => params.append('user_id', id.toString()));
                    try {
                        const statusesResponse = await api.get<StatusMap>(
                            `/connections/status-batch?${params.toString()}`
                        );
                        setConnectionStatuses(statusesResponse.data);
                    } catch (statusError: unknown) {
                        console.error("Fetch connection statuses error:", statusError);
                    }
                }
            }
        } else if (fetchedData && 'message' in fetchedData) {
            setError(fetchedData.message);
            setMatches([]);
        } else {
            setMatches([]);
        }

      } catch (err: unknown) {
        console.error("Fetch matches error:", err);
        const apiError = err as ApiError;
        setError(apiError.response?.data?.detail || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    if (token && user && user.status !== 'WAITLISTED') {
      fetchMatchesAndStatuses();
    } else if (!token && !isLoadingAuth) {
      setError('Authentication required. Please log in.');
      setIsLoading(false);
    }
  }, [token, user, isLoadingAuth]);

  const filteredMatches = useMemo(() => {
    if (!searchTerm) return matches;
    return matches.filter(match => {
      const profile = match.profile;
      const term = searchTerm.toLowerCase();
      return (
        profile.full_name?.toLowerCase().includes(term) ||
        profile.title?.toLowerCase().includes(term) ||
        profile.bio?.toLowerCase().includes(term) ||
        profile.skills_expertise?.some(skill => skill.toLowerCase().includes(term))
      );
    });
  }, [matches, searchTerm]);

  const getInitialStatus = (userId: number): 'idle' | 'pending' | 'connected' => {
    const statusInfo = connectionStatuses[userId];
    if (!statusInfo) return 'idle';
    
    switch (statusInfo.status) {
        case 'connected':
            return 'connected';
        case 'pending_from_me':
        case 'pending_from_them':
            return 'pending';
        default:
            return 'idle';
    }
  };

  const renderContent = () => {
    if (isLoadingAuth || (isLoading && user?.status !== 'WAITLISTED')) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <Skeleton key={index} className="h-[420px] w-full rounded-xl" />
          ))}
        </div>
      );
    }

    if (user?.status === 'WAITLISTED') {
      return (
        <div className="flex items-center justify-center h-[50vh] bg-gray-50 rounded-2xl">
            <Alert variant="default" className="max-w-lg text-center shadow-lg border-orange-500/50">
              <Lock className="h-6 w-6 text-orange-600 mx-auto mb-3" />
              <AlertTitle className="text-xl font-semibold text-orange-800">Feature Locked: Discover Connections</AlertTitle>
              <AlertDescription className="text-muted-foreground mt-2">
                This feature will become available once you are actively assigned to a space.
                In the meantime, completing your profile will improve your visibility once you join a space.
              </AlertDescription>
              <div className="mt-6 flex items-center justify-center gap-x-4">
                <Button asChild>
                  <Link href="/dashboard/profile/edit">Complete Your Profile</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </Alert>
        </div>
      );
    }

    if (!user?.space_id) {
        return (
            <Alert>
                <Info className="h-5 w-5" />
                <AlertTitle>Start Your Journey!</AlertTitle>
                <AlertDescription>
                    The Discover feature is where you&apos;ll find other members inside your workspace.
                    Since you&apos;re not part of a space yet, your next step is to explore potential spaces or get invited by a Corporate Admin.
                    <br /><br />
                    Keep your <Link href="/dashboard/profile/edit" className="text-primary hover:underline">profile</Link> updated to increase your chances of being discovered!
                </AlertDescription>
            </Alert>
        );
    }

    if (error && !filteredMatches.length) {
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

    if (!isLoading && filteredMatches.length === 0) {
      return (
         <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Matches Found</AlertTitle>
            <AlertDescription>
              We couldn&apos;t find any potential matches for you right now. Try adjusting your search or updating your profile with more details!
            </AlertDescription>
        </Alert>
      );
    }

    return (
      <>
        {error && filteredMatches.length > 0 && (
             <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
          {filteredMatches.map((match, index) => 
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
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Discover Connections</h1>
            <p className="text-muted-foreground mt-2">Browse and connect with professionals in your space.</p>
        </div>

        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm py-4 mb-8">
            <div className="flex gap-4 items-center">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name, title, skill..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                            onClick={() => setSearchTerm('')}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <Button variant="outline" onClick={() => setIsFilterSheetOpen(true)}>
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                </Button>
            </div>
        </div>

        {renderContent()}
        <FilterSheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen} />
      </div>
  );
}