'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Use next/navigation for App Router
import CompanyProfileDisplay from '@/components/organization/CompanyProfileDisplay';
import { useAuthStore } from '@/store/authStore';
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

// Define the expected structure matching the display component
interface CompanyData {
  id: number;
  name: string;
  logo_url?: string | null;
  industry_focus?: string | null;
  description?: string | null;
  website?: string | null;
  created_at: string;
  updated_at?: string | null;
}

const CompanyPage = () => {
  const params = useParams();
  const companyId = params?.id;
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!companyId || !token) {
      // Wait for ID and token
      if (!token) setError("Authentication required.");
      if (!companyId) setError("Company ID not found.");
      setLoading(false);
      return;
    }

    const fetchCompany = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/organizations/companies/${companyId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Company not found.');
          } else if (response.status === 401 || response.status === 403) {
            throw new Error('Unauthorized or forbidden.');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: CompanyData = await response.json();
        setCompany(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch company data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId, token]); // Re-run effect if ID or token changes

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

  if (!company) {
     return (
        <div className="container mx-auto py-8 text-center">
          <p>Company data not available.</p>
        </div>
     );
  }

  return (
    <div className="container mx-auto py-8">
      <CompanyProfileDisplay company={company} />
      {/* Future: Add section to list active members */}
    </div>
  );
};

export default CompanyPage; 