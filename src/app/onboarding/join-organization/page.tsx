'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Building, Rocket, Info, Loader2 } from 'lucide-react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Organization {
  id: number;
  name: string;
  type: 'company' | 'startup';
}

export default function JoinOrganizationPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [domainMatchOrg, setDomainMatchOrg] = useState<Organization | null>(null);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const authIsLoading = useAuthStore((state) => state.isLoading);
  const [sentRequests, setSentRequests] = useState<number[]>([]);

  // Effect to check for domain match on component load
  useEffect(() => {
    // Wait for auth to be loaded from storage
    if (authIsLoading) return;

    const checkDomain = async () => {
      if (!user?.email || !user.email.includes('@')) return;

      const domain = user.email.split('@')[1];
      try {
        const response = await api.get(`/organizations/domain-check?domain=${domain}`);
        if (response.data) {
          setDomainMatchOrg(response.data);
        }
      } catch (err) {
        // Fail silently if no match is found or an error occurs
        console.error("Domain check failed:", err);
      }
    };
    checkDomain();
  }, [user, authIsLoading]);
  
  // Debounced search effect
  useEffect(() => {
    // Wait for auth to be loaded from storage
    if (authIsLoading) return;

    const handler = setTimeout(async () => {
      if (searchTerm.length > 2) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await api.get(`/organizations/search?name=${searchTerm}`);
          setResults(response.data);
        } catch (err: any) {
          setError(err.response?.data?.detail || 'Failed to fetch organizations.');
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(handler);
  }, [searchTerm, authIsLoading]);

  const handleRequestToJoin = async (orgId: number, orgType: string) => {
    const toastId = toast.loading("Sending Request...", {
      description: "Please wait.",
    });

    try {
      await api.post('/organizations/join-request', { organization_id: orgId, organization_type: orgType });
      toast.dismiss(toastId);
      
      setSentRequests(prev => [...prev, orgId]);
      router.push('/onboarding/pending-approval');

    } catch (err: any) {
       toast.error("Error", {
        id: toastId,
        description: err.response?.data?.detail || "Could not send request.",
      });
    }
  };

  const handleDomainJoin = async () => {
    if (!domainMatchOrg) return;
    handleRequestToJoin(domainMatchOrg.id, domainMatchOrg.type);
    // You might have a specific endpoint for auto-joining
    // For now, we use the same request flow
  };

  if (authIsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="flex justify-center items-start min-h-screen bg-background pt-16">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Join Your Organization</CardTitle>
            <CardDescription>Find your company or startup to request access.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {domainMatchOrg && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>We found a match for you!</AlertTitle>
                <AlertDescription className="flex justify-between items-center">
                  <p>Your email domain matches <strong>{domainMatchOrg.name}</strong>. Join them directly.</p>
                  <Button onClick={handleDomainJoin}>Join {domainMatchOrg.name}</Button>
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Input
                type="search"
                placeholder="Search for your organization by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              {isLoading && <p>Searching...</p>}
              {error && <p className="text-destructive">{error}</p>}
              {!isLoading && results.length === 0 && searchTerm.length > 2 && <p className="text-muted-foreground text-center">No organizations found.</p>}
              
              {results.map((org) => (
                <div key={org.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center">
                    {org.type === 'company' ? <Building className="h-6 w-6 mr-3 text-primary" /> : <Rocket className="h-6 w-6 mr-3 text-primary" />}
                    <div>
                      <h4 className="font-semibold">{org.name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">{org.type}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => handleRequestToJoin(org.id, org.type)}
                    disabled={sentRequests.includes(org.id)}
                  >
                    {sentRequests.includes(org.id) ? "Request Sent" : "Request to Join"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
} 