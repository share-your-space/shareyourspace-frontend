"use client";

import React, { useState, useMemo } from 'react';
import { SpaceCard } from '@/components/ui/SpaceCard';
import { toast } from 'sonner';
import { BrowsableSpace } from '@/types/space';
import { UserRole } from '@/types/enums';
import { mockBrowsableSpaces } from '@/lib/mock-data';
import { useAuthStore } from '@/store/authStore';

const BrowseSpacesPage = () => {
  const [spaces, setSpaces] = useState<BrowsableSpace[]>(mockBrowsableSpaces);
  const [loading] = useState(false); // Not really loading anymore
  const { user } = useAuthStore();

  const canExpressInterest =
    user?.role === UserRole.FREELANCER ||
    user?.role === UserRole.STARTUP_ADMIN;

  const { currentUserSpace, otherSpaces } = useMemo(() => {
    const currentUserSpace = spaces.find(space => space.id === user?.space_id);
    const otherSpaces = spaces.filter(space => space.id !== user?.space_id);
    return { currentUserSpace, otherSpaces };
  }, [spaces, user?.space_id]);

  const handleExpressInterest = async (spaceId: string) => {
    toast.success('Your interest has been registered!');
    setSpaces((prevSpaces) =>
      prevSpaces.map((space) =>
        space.id.toString() === spaceId
          ? { ...space, interest_status: 'interested' }
          : space
      )
    );
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
        <p>No other spaces available to browse.</p>
      )}
    </div>
  );
};

export default BrowseSpacesPage;