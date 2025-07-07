"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Space } from '@/types/space';
import { getCompanySpaces } from '@/lib/api/corp-admin';
import { useAuth } from './AuthContext';
import { UserRole } from '@/types/enums';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

interface SpaceContextType {
  spaces: Space[];
  setSpaces: (spaces: Space[]) => void;
  selectedSpace: Space | null;
  setSelectedSpaceId: (id: string | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  showOnboarding: boolean;
  refetchSpaces: () => Promise<void>;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export const SpaceProvider = ({ children }: { children: React.ReactNode }) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const user = useAuthStore((state) => state.user);

  const refetchSpaces = useCallback(async () => {
    if (!user || user.role !== UserRole.CORP_ADMIN) {
      setSpaces([]);
      return;
    }
    setLoading(true);
    try {
      const companySpaces = await getCompanySpaces();
      setSpaces(companySpaces);
      setShowOnboarding(companySpaces.length === 0);
      // If there's no selection or the current selection is invalid, select the first one.
      const currentSelectionIsValid = companySpaces.some(s => s.id.toString() === selectedSpaceId);
      if (companySpaces.length > 0 && !currentSelectionIsValid) {
        setSelectedSpaceId(companySpaces[0].id.toString());
      } else if (companySpaces.length === 0) {
        setSelectedSpaceId(null);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setShowOnboarding(true);
        setSpaces([]);
      } else {
        console.error("Failed to fetch company spaces:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

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
