'use client';

import React, { useState, useMemo } from 'react';
import { MatchCard } from '@/components/discover/MatchCard';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from '@/components/ui/input';
import { FilterSheet } from '@/components/discover/FilterSheet';
import { UserProfile } from '@/types/userProfile';
import { mockUserProfiles } from '@/lib/mock-data';

// Types for this page
type ConnectionStatusValue = 'connected' | 'pending_from_me' | 'pending_from_them' | 'not_connected' | 'declined';

interface MatchResult {
  profile: UserProfile;
  score: number;
  reasons: string[];
}

// Convert mockUserProfiles to MatchResult[]
const dummyMatches: MatchResult[] = Object.values(mockUserProfiles)
  .filter(p => p.user_id !== 'user-1') // Exclude the current user
  .map((profile, index) => ({
    profile,
    score: 0.95 - (index * 0.05), // Example score
    reasons: ['Shared interest in AI', 'Experience with React'], // Example reasons
  }));


const dummyConnectionStatuses: Record<string, { status: ConnectionStatusValue }> = {
  'user-2': { status: 'not_connected' },
  'user-3': { status: 'pending_from_me' },
  'user-4': { status: 'connected' },
};

export default function DiscoverPage() {
  const [matches] = useState<MatchResult[]>(dummyMatches);
  const [connectionStatuses, setConnectionStatuses] = useState(dummyConnectionStatuses);
  const [isLoading] = useState<boolean>(false);
  const [error] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const filteredMatches = useMemo(() => {
    return matches.filter(match =>
      match.profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [matches, searchTerm]);

  const handleConnect = (userId: string) => {
    console.log(`Connect with user ${userId}`);
    setConnectionStatuses(prev => ({ ...prev, [userId]: { status: 'pending_from_me' } }));
  };

  const handleAccept = (userId: string) => {
    console.log(`Accept connection from user ${userId}`);
    setConnectionStatuses(prev => ({ ...prev, [userId]: { status: 'connected' } }));
  };

  const handleDecline = (userId: string) => {
    console.log(`Decline connection from user ${userId}`);
    setConnectionStatuses(prev => ({ ...prev, [userId]: { status: 'declined' } }));
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder="Search by name, title, or skill..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <FilterSheet
        open={isFilterSheetOpen}
        onOpenChange={setIsFilterSheetOpen}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-96 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMatches.map((match) => (
            <MatchCard
              key={match.profile.id}
              match={{
                profile: match.profile,
                score: match.score,
                reasons: match.reasons,
              }}
              connectionStatus={connectionStatuses[match.profile.user_id]?.status || 'not_connected'}
              onConnect={() => handleConnect(match.profile.user_id)}
              onAccept={() => handleAccept(match.profile.user_id)}
              onDecline={() => handleDecline(match.profile.user_id)}
              onSendMessage={() => console.log('send message')}
            />
          ))}
        </div>
      )}
    </div>
  );
}