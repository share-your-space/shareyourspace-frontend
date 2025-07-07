"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { BrowsableSpace } from '@/types/space';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/base';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types/enums';
import Link from 'next/link';
import { SpaceCard } from '@/components/ui/SpaceCard';

const BrowseSpacesPage = () => {
  const [spaces, setSpaces] = useState<BrowsableSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuthStore();
  
  const canExpressInterest =
    user?.role === UserRole.FREELANCER ||
    user?.role === UserRole.STARTUP_ADMIN;

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    const fetchSpaces = async () => {
      try {
        const response = await apiClient.get<{ spaces: BrowsableSpace[] }>(
          '/spaces/browseable'
        );
        setSpaces(response.data.spaces);
      } catch (error) {
        toast.error('Failed to load spaces.');
        console.error('Failed to fetch spaces:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpaces();
  }, [isAuthenticated]);

  const { currentUserSpace, otherSpaces } = useMemo(() => {
    const currentUserSpace = spaces.find(space => space.id === user?.space_id);
    const otherSpaces = spaces.filter(space => space.id !== user?.space_id);
    return { currentUserSpace, otherSpaces };
  }, [spaces, user?.space_id]);

  const handleExpressInterest = async (spaceId: string) => {
    try {
      await apiClient.post(`/interests/space/${spaceId}/express`);
      toast.success('Your interest has been registered!');
      // Optionally, update the specific space's interest_status locally
      setSpaces((prevSpaces) =>
        prevSpaces.map((space) =>
          space.id.toString() === spaceId
            ? { ...space, interest_status: 'PENDING' }
            : space
        )
      );
    } catch (error) {
      toast.error(
        'Failed to register interest. You may have already expressed interest in this space.'
      );
      console.error(error);
    }
  };

  if (loading) {
    return <p>Loading spaces...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      {currentUserSpace && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Your Current Space</h2>
          <div className="max-w-xs">
            <SpaceCard
              space={currentUserSpace}
              onExpressInterest={handleExpressInterest}
              canExpressInterest={canExpressInterest}
              isCurrentUserSpace={true}
            />
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">Discover New Spaces</h1>
      {otherSpaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {otherSpaces.map((space) => (
            <SpaceCard
              key={space.id}
              space={space}
              onExpressInterest={handleExpressInterest}
              canExpressInterest={canExpressInterest}
              isCurrentUserSpace={false}
            />
          ))}
        </div>
      ) : (
        <p>No other spaces available to browse at the moment.</p>
      )}
    </div>
  );
};

export default BrowseSpacesPage; 