'use client';

import { useEffect, useState, Suspense } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success'>('loading');
  const [message, setMessage] = useState('Verifying your email, please wait...');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('success');
      setMessage('Email verified successfully! You can now log in.');
    }, 2000); // Simulate a 2-second verification process

    return () => clearTimeout(timer);
  }, []);

  const renderIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{message}</p>
          {status === 'success' && (
            <Button asChild className="mt-6">
              <Link href="/login">Go to Login</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
