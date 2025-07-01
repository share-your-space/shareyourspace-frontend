'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email, please wait...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Verification token not found in URL.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully! You can now log in.');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.detail || 'An error occurred during verification.');
      }
    };

    verifyToken();
  }, [searchParams]);

  const renderIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-12 w-12 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md text-center p-6">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {renderIcon()}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Verifying Email'}
            {status === 'success' && 'Verification Successful'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{message}</p>
          {status === 'success' && (
            <Button asChild className="mt-6">
              <Link href="/login">Proceed to Login</Link>
            </Button>
          )}
          {status === 'error' && (
             <Button onClick={() => router.push('/signup')} className="mt-6">
              Return to Sign Up
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
