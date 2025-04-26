'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Use next/navigation for App Router
import StartupProfileDisplay from '@/components/organization/StartupProfileDisplay';
import { useAuthStore } from '@/store/authStore';
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

// Define the expected structure matching the display component
interface StartupData {
  id: number;
  name: string;
  logo_url?: string | null;
  industry_focus?: string | null;
  description?: string | null;
  mission?: string | null;
  website?: string | null;
  created_at: string;
  updated_at?: string | null;
}

const StartupPage = () => {
  const params = useParams();
  const startupId = params?.id;
  const [startup, setStartup] = useState<StartupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!startupId || !token) {
      // Wait for ID and token
      if (!token) setError("Authentication required.");
      if (!startupId) setError("Startup ID not found.");
      setLoading(false);
      return;
    }

    const fetchStartup = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/organizations/startups/${startupId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Startup not found.');
          } else if (response.status === 401 || response.status === 403) {
            throw new Error('Unauthorized or forbidden.');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: StartupData = await response.json();
        setStartup(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch startup data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStartup();
  }, [startupId, token]); // Re-run effect if ID or token changes

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-screen">
             <Skeleton className="w-full max-w-2xl h-[300px]" />
        </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!startup) {
     return (
        <div className="container mx-auto py-8 text-center">
          <p>Startup data not available.</p>
        </div>
     );
  }

  return (
    <div className="container mx-auto py-8">
      <StartupProfileDisplay startup={startup} />
      {/* Future: Add section to list active members */}
    </div>
  );
};

export default StartupPage; 