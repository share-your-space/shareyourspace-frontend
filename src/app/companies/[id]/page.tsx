'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Use next/navigation for App Router
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'; // Import layout
import CompanyProfileDisplay from '@/components/organization/CompanyProfileDisplay';
import { useAuthStore } from '@/store/authStore';
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import { api } from '@/lib/api'; // Import api client

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
    if (!companyId) { // ID is required
      setError("Company ID not found in URL.");
      setLoading(false);
      return;
    }
    if (!token) { // Token is required for API call
      setError("Authentication required to view company details.");
      setLoading(false);
      return;
    }

    const fetchCompany = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use api client
        const response = await api.get<CompanyData>(`/organizations/companies/${companyId}`);
        setCompany(response.data);
      } catch (err: any) {
        console.error("Fetch company error:", err);
        if (err.response?.status === 404) {
          setError('Company not found.');
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          setError('You are not authorized to view this company profile.');
        } else {
          setError(err.response?.data?.detail || err.message || 'Failed to fetch company data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId, token]);

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center min-h-[calc(100vh-theme(space.16))]" >
          <Skeleton className="w-full max-w-2xl h-[300px]" />
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout>
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

  if (!company) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto py-8 text-center">
          <p>Company data not available.</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-8">
        <CompanyProfileDisplay company={company} />
        {/* Future: Add section to list active members */}
      </div>
    </AuthenticatedLayout>
  );
};

export default CompanyPage; 