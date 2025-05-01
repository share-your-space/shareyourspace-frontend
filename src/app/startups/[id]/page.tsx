'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Use next/navigation for App Router
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'; // Import layout
import StartupProfileDisplay from '@/components/organization/StartupProfileDisplay';
import { useAuthStore } from '@/store/authStore';
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import { api } from '@/lib/api'; // Import api client

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
    if (!startupId) { // ID is required
       setError("Startup ID not found in URL.");
       setLoading(false);
       return;
    }
     if (!token) { // Token is required for API call
        setError("Authentication required to view startup details.");
        setLoading(false);
        return;
    }

    const fetchStartup = async () => {
      setLoading(true);
      setError(null);
      try {
         // Use api client
        const response = await api.get<StartupData>(`/organizations/startups/${startupId}`);
        setStartup(response.data);
      } catch (err: any) {
        console.error("Fetch startup error:", err);
        if (err.response?.status === 404) {
             setError('Startup not found.');
        } else if (err.response?.status === 401 || err.response?.status === 403) {
             setError('You are not authorized to view this startup profile.');
        } else {
            setError(err.response?.data?.detail || err.message || 'Failed to fetch startup data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStartup();
  }, [startupId, token]);

  if (loading) {
    return (
      <AuthenticatedLayout> {/* Wrap content in layout */} 
        <div className="flex justify-center items-center min-h-[calc(100vh-theme(space.16))]" > {/* Adjust height */} 
             <Skeleton className="w-full max-w-2xl h-[300px]" />
        </div>
       </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout> {/* Wrap content in layout */} 
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
       </AuthenticatedLayout>
    );
  }

  if (!startup) {
     return (
       <AuthenticatedLayout> {/* Wrap content in layout */} 
        <div className="container mx-auto py-8 text-center">
          <p>Startup data not available.</p>
        </div>
       </AuthenticatedLayout>
     );
  }

  return (
    <AuthenticatedLayout> {/* Wrap content in layout */} 
    <div className="container mx-auto py-8">
      <StartupProfileDisplay startup={startup} />
      {/* Future: Add section to list active members */}
    </div>
    </AuthenticatedLayout>
  );
};

export default StartupPage; 