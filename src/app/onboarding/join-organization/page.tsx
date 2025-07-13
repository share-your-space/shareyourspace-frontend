'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Building, Rocket, Info, Loader2 } from 'lucide-react';

interface Organization {
  id: number;
  name: string;
  type: 'company' | 'startup';
  domain?: string;
}

const mockOrganizations: Organization[] = [
  { id: 1, name: 'Innovate Inc.', type: 'company', domain: 'innovate.com' },
  { id: 2, name: 'QuantumLeap AI', type: 'startup' },
  { id: 3, name: 'Example Corp', type: 'company', domain: 'examplecorp.com' },
  { id: 4, name: 'Synergy Solutions', type: 'company' },
  { id: 5, name: 'NextGen Tech', type: 'startup' },
  { id: 6, name: 'DataDriven LLC', type: 'company', domain: 'datadriven.com' },
];

const mockUser = {
  email: 'test.user@examplecorp.com',
  name: 'Test User',
};

export default function JoinOrganizationPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [domainMatchOrg, setDomainMatchOrg] = useState<Organization | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<number[]>([]);

  // Effect to check for domain match on component load
  useEffect(() => {
    const checkDomain = () => {
      if (!mockUser?.email || !mockUser.email.includes('@')) return;

      const domain = mockUser.email.split('@')[1];
      const matchedOrg = mockOrganizations.find(org => org.domain === domain);
      
      if (matchedOrg) {
        setDomainMatchOrg(matchedOrg);
      }
    };
    checkDomain();
  }, []);
  
  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.length > 2) {
        setIsLoading(true);
        setError(null);
        
        const filteredResults = mockOrganizations.filter(org =>
          org.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        setResults(filteredResults);
        setIsLoading(false);
        
        if (filteredResults.length === 0) {
          setError('No organizations found with that name.');
        }
      } else {
        setResults([]);
        setError(null);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleRequestToJoin = (orgId: number, orgName: string) => {
    const toastId = toast.loading("Sending Request...", {
      description: `Requesting to join ${orgName}.`,
    });

    setTimeout(() => {
      toast.success("Request Sent!", {
        id: toastId,
        description: `Your request to join ${orgName} has been sent for approval.`,
      });
      setSentRequests(prev => [...prev, orgId]);
      router.push('/onboarding/pending-approval');
    }, 1000);
  };

  const handleDomainJoin = () => {
    if (!domainMatchOrg) return;
    handleRequestToJoin(domainMatchOrg.id, domainMatchOrg.name);
  };

  return (
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
                <Button onClick={handleDomainJoin} disabled={sentRequests.includes(domainMatchOrg.id)}>
                  {sentRequests.includes(domainMatchOrg.id) ? 'Request Sent' : `Join ${domainMatchOrg.name}`}
                </Button>
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
            {isLoading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="ml-2">Searching...</p>
              </div>
            )}
            {error && !isLoading && <p className="text-destructive text-center">{error}</p>}
            {!isLoading && results.length === 0 && searchTerm.length > 2 && !error && (
              <p className="text-muted-foreground text-center">No organizations found.</p>
            )}
            
            {results.map((org) => (
              <Card key={org.id} className="p-4 flex justify-between items-center">
                <div className="flex items-center">
                  {org.type === 'company' ? <Building className="h-6 w-6 mr-4 text-primary" /> : <Rocket className="h-6 w-6 mr-4 text-primary" />}
                  <div>
                    <p className="font-semibold">{org.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{org.type}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleRequestToJoin(org.id, org.name)}
                  disabled={sentRequests.includes(org.id)}
                  variant={sentRequests.includes(org.id) ? 'secondary' : 'default'}
                >
                  {sentRequests.includes(org.id) ? 'Request Sent' : 'Request to Join'}
                </Button>
              </Card>
            ))}
          </div>

          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>Can&apos;t find your organization?</p>
            <Button variant="link" onClick={() => router.push('/onboarding/start')}>
              Create a new company or startup profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}