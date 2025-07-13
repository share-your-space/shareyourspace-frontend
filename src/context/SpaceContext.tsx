"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Space } from '@/types/space';
import { UserRole } from '@/types/enums';
import { useAuthStore } from '@/store/authStore';
import { mockSpaces } from '@/lib/mock-data';

interface SpaceContextType {
  spaces: Space[];
  setSpaces: (spaces: Space[]) => void;
  selectedSpace: Space | null;
  setSelectedSpaceId: (id: string | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  showOnboarding: boolean;
  refetchSpaces: () => void;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export const SpaceProvider = ({ children }: { children: React.ReactNode }) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const user = useAuthStore((state) => state.user);

  const refetchSpaces = useCallback(() => {
    if (!user || user.role !== UserRole.CORP_ADMIN || !user.company_id) {
      setSpaces([]);
      setLoading(false);
      setShowOnboarding(user?.role === UserRole.CORP_ADMIN);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const companySpaces = mockSpaces.filter(space => space.company_id === user.company_id);
      setSpaces(companySpaces);
      setShowOnboarding(companySpaces.length === 0);

      const currentSelectionIsValid = companySpaces.some(s => s.id.toString() === selectedSpaceId);
      if (companySpaces.length > 0 && !currentSelectionIsValid) {
        setSelectedSpaceId(companySpaces[0].id.toString());
      } else if (companySpaces.length === 0) {
        setSelectedSpaceId(null);
      }
      setLoading(false);
    }, 500); // Simulate network delay
  }, [user, selectedSpaceId]);

  useEffect(() => {
    refetchSpaces();
  }, [refetchSpaces]);

  const selectedSpace = useMemo(() => {
    if (!selectedSpaceId) return null;
    return spaces.find(space => space.id.toString() === selectedSpaceId) ?? null;
  }, [selectedSpaceId, spaces]);

  return (
    <SpaceContext.Provider value={{ 
      spaces, 
      setSpaces, 
      selectedSpace, 
      setSelectedSpaceId, 
      loading, 
      setLoading,
      showOnboarding,
      refetchSpaces
    }}>
      {children}
    </SpaceContext.Provider>
  );
};

export const useSpace = () => {
  const context = useContext(SpaceContext);
  if (context === undefined) {
    throw new Error('useSpace must be used within a SpaceProvider');
  }
  return context;
};
