'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import { api } from "@/lib/api"; // Import shared API client

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token not found in URL.');
        return;
      }

      setStatus('loading');
      try {
        // Use the imported api client
        const response = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = response.data; // Data is directly available in response.data with Axios

        if (response.status === 200 && data.role) {
          setMessage(data.message || 'Email verified successfully! Preparing your next step...');
          setStatus('success');
          
          const userRole = data.role;
          // Determine redirect based on role
          if (['STARTUP_ADMIN', 'STARTUP_MEMBER', 'FREELANCER'].includes(userRole)) {
            router.push('/auth/waitlist');
          } else if (userRole === 'CORP_ADMIN') {
            router.push('/auth/pending-onboarding');
          } else {
            // Handle other roles or default to login
            setMessage('Email verified, but role unclear. Redirecting to login.');
            setTimeout(() => router.push('/login'), 3000);
          }
        } else if (response.status === 200) {
            // Success but role missing (shouldn't happen with current backend)
            setStatus('success');
            setMessage(data.message || 'Email verified successfully! Role information missing, proceeding to login.');
            setTimeout(() => router.push('/login'), 3000);
        } else {
          // This case might not be reachable if api client throws for non-2xx
          setStatus('error');
          setMessage(data.detail || 'Failed to verify email. The link may be invalid or expired.');
        }
      } catch (error: any) {
        console.error("Verification error:", error);
        setStatus('error');
        // Use Axios error structure
        setMessage(error.response?.data?.detail || error.message || 'An unexpected error occurred during verification.');
      }
    };

    verifyToken();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'loading' && <p>Verifying your email...</p>}

          {status === 'success' && (
             <Alert variant="default">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  {message}
                </AlertDescription>
              </Alert>
          )}

          {status === 'error' && (
            <>
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Verification Failed</AlertTitle>
                <AlertDescription>
                  {message}
                </AlertDescription>
              </Alert>
              <Button asChild variant="secondary" className="w-full mt-4">
                <Link href="/signup">Try Signing Up Again</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Wrap the component in Suspense because useSearchParams requires it
const VerifyEmailPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
};


export default VerifyEmailPage; 