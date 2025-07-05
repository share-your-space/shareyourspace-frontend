"use client";

import React, { useEffect, useState } from 'react';
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
  const { user } = useAuthStore();
  
  const canExpressInterest =
    user?.role === UserRole.FREELANCER ||
    user?.role === UserRole.STARTUP_ADMIN;

  useEffect(() => {
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
  }, []);

  const handleExpressInterest = async (spaceId: string) => {
    try {
      await apiClient.post(`/interests/space/${spaceId}/express`);
      toast.success('Your interest has been registered!');
      // Optionally, update the specific space's interest_status locally
      setSpaces((prevSpaces) =>
        prevSpaces.map((space) =>
          space.id.toString() === spaceId
            ? { ...space, interest_status: 'interested' }
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
      <h1 className="text-3xl font-bold mb-6">Discover New Spaces</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {spaces.map((space) => (
          <SpaceCard
            key={space.id}
            space={space}
            onExpressInterest={handleExpressInterest}
            canExpressInterest={canExpressInterest}
          />
        ))}
      </div>
    </div>
  );
};

export default BrowseSpacesPage; 