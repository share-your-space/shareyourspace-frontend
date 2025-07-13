"use client";

import React, { useState, useMemo } from 'react';
import { SpaceCard } from '@/components/ui/SpaceCard';
import { toast } from 'sonner';

// Define the types right here for simplicity
enum UserRole {
  FREELANCER = "FREELANCER",
  STARTUP_ADMIN = "STARTUP_ADMIN",
  COMPANY_ADMIN = "COMPANY_ADMIN",
  SYS_ADMIN = "SYS_ADMIN",
}

interface BrowsableSpace {
  id: string;
  name: string;
  headline: string;
  description: string;
  address: string;
  cover_image_url: string;
  amenities: string[];
  vibe: string;
  company_name: string;
  interest_status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null;
  total_workstations: number;
  company_id: number;
}

// Dummy Data
const dummySpaces: BrowsableSpace[] = [
  {
    id: '1',
    name: 'Creative Hub',
    headline: 'A vibrant space for creators',
    description: 'This is a great place for artists and designers to collaborate.',
    address: '123 Art Street, Creativity City',
    cover_image_url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070&auto=format&fit=crop',
    amenities: ['Wi-Fi', 'Coffee', 'Printing'],
    vibe: 'Energetic and inspiring',
    company_name: 'Innovate Inc.',
    interest_status: null,
    total_workstations: 15,
    company_id: 101,
  },
  {
    id: '2',
    name: 'Tech Central',
    headline: 'The heart of tech innovation',
    description: 'A modern co-working space for tech startups and developers.',
    address: '456 Tech Avenue, Silicon Valley',
    cover_image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop',
    amenities: ['High-speed Wi-Fi', 'Meeting Rooms', '24/7 Access'],
    vibe: 'Focused and collaborative',
    company_name: 'Future Tech',
    interest_status: 'PENDING',
    total_workstations: 40,
    company_id: 102,
  },
  {
    id: '3',
    name: 'Quiet Corner',
    headline: 'For focus and deep work',
    description: 'A peaceful environment for writers, researchers, and anyone needing quiet.',
    address: '789 Serenity Lane, Calm Town',
    cover_image_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop',
    amenities: ['Silent Zone', 'Library', 'Tea & Coffee'],
    vibe: 'Calm and studious',
    company_name: 'Tranquil Spaces',
    interest_status: null,
    total_workstations: 20,
    company_id: 103,
  },
];

const BrowseSpacesPage = () => {
  const [spaces, setSpaces] = useState<BrowsableSpace[]>(dummySpaces);
  const [loading] = useState(false); // Not really loading anymore

  // Mocked user data
  const user = {
    role: UserRole.FREELANCER,
    space_id: '1',
  };

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
          ? { ...space, interest_status: 'PENDING' }
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