'use client';

import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { MatchCard } from '@/components/discover/MatchCard';
import { useAuthStore } from '@/store/authStore';
import { type MatchResult } from '@/types/matching';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertTriangle, Info } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Define the expected API response structure
// interface ApiResponse {
//   matches: MatchResult[];
// }

export default function DiscoverPage() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true);
      setError(null);

      if (!token) {
        setError('Authentication required. Please log in.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/matching/discover', { // Use relative path for API route
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          let errorDetail = 'Failed to fetch matches.';
          try {
             const errorData = await response.json();
             errorDetail = errorData.detail || errorDetail;
          } catch (jsonError) {
             // Keep default error message if response is not JSON
          }
          throw new Error(`${response.status}: ${errorDetail}`);
        }

        const data: MatchResult[] = await response.json();
        setMatches(data);
        
      } catch (err: any) {
        console.error("Fetch matches error:", err);
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [token]); // Re-fetch if token changes

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

    if (error) {
      return (
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (matches.length === 0) {
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

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match, index) => (
          <MatchCard key={match.profile.user_id || index} match={match} />
        ))}
      </div>
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