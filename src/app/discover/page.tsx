'use client';

import React, { useState, useMemo } from 'react';
import { MatchCard, MatchCardProps } from '@/components/discover/MatchCard';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from '@/components/ui/input';
import { FilterSheet } from '@/components/discover/FilterSheet';
import { UserProfile } from '@/types/userProfile';

// Types for this page
type ConnectionStatusValue = 'connected' | 'pending_from_me' | 'pending_from_them' | 'not_connected' | 'declined';

interface MatchResult {
  profile: UserProfile;
  score: number;
  reasons: string[];
}

// Dummy Data
const dummyMatches: MatchResult[] = [
  {
    profile: {
      id: 1,
      user_id: 1,
      full_name: 'Alice Johnson',
      title: 'Software Engineer',
      headline: 'Building the future of tech.',
      profile_picture_signed_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop',
      skills_expertise: ['React', 'Node.js', 'Python'],
    },
    score: 0.95,
    reasons: ['Shared interest in AI', 'Experience with React'],
  },
  {
    profile: {
      id: 2,
      user_id: 2,
      full_name: 'Bob Williams',
      title: 'UX Designer',
      headline: 'Designing intuitive user experiences.',
      profile_picture_signed_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop',
      skills_expertise: ['Figma', 'User Research', 'Prototyping'],
    },
    score: 0.88,
    reasons: ['Complementary skills for your project', 'Based in the same city'],
  },
  {
    profile: {
      id: 3,
      user_id: 3,
      full_name: 'Charlie Brown',
      title: 'Data Scientist',
      headline: 'Turning data into insights.',
      profile_picture_signed_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop',
      skills_expertise: ['Python', 'Machine Learning', 'SQL'],
    },
    score: 0.82,
    reasons: ['Strong background in machine learning'],
  },
];

const dummyConnectionStatuses: Record<number, { status: ConnectionStatusValue }> = {
  1: { status: 'not_connected' },
  2: { status: 'pending_from_me' },
  3: { status: 'connected' },
};

export default function DiscoverPage() {
  const [matches] = useState<MatchResult[]>(dummyMatches);
  const [connectionStatuses, setConnectionStatuses] = useState(dummyConnectionStatuses);
  const [isLoading] = useState<boolean>(false);
  const [error] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const user = { status: 'ACTIVE' }; // Mocked user

  const filteredMatches = useMemo(() => {
    return matches.filter(match =>
      match.profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [matches, searchTerm]);

  const handleConnect = (userId: number) => {
    console.log(`Connect with user ${userId}`);
    setConnectionStatuses(prev => ({ ...prev, [userId]: { status: 'pending_from_me' } }));
  };

  const handleAccept = (userId: number) => {
    console.log(`Accept connection from user ${userId}`);
    setConnectionStatuses(prev => ({ ...prev, [userId]: { status: 'connected' } }));
  };

  const handleDecline = (userId: number) => {
    console.log(`Decline connection from user ${userId}`);
    setConnectionStatuses(prev => ({ ...prev, [userId]: { status: 'declined' } }));
  };

  const handleSendMessage = (userId: number) => {
    console.log(`Send message to user ${userId}`);
  };

  if (user.status === 'WAITLISTED') {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert className="max-w-md">
          <Info className="h-4 w-4" />
          <AlertTitle>You are on the waitlist!</AlertTitle>
          <AlertDescription>
            We&apos;re excited to have you. You&apos;ll be able to discover other members once your access is granted.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Discover</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <FilterSheet
            open={isFilterSheetOpen}
            onOpenChange={setIsFilterSheetOpen}
            onApplyFilters={() => {}}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMatches.map((match) => (
            <MatchCard
              key={match.profile.user_id}
              match={match}
              connectionStatus={connectionStatuses[match.profile.user_id]?.status || 'not_connected'}
              onConnect={() => handleConnect(match.profile.user_id)}
              onAccept={() => handleAccept(match.profile.user_id)}
              onDecline={() => handleDecline(match.profile.user_id)}
              onSendMessage={() => handleSendMessage(match.profile.user_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}