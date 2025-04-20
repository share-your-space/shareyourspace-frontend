'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function WaitlistPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>You're on the Waitlist!</CardTitle>
          <CardDescription>Welcome to the ShareYourSpace talent pool.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Thank you for signing up! Your profile has been successfully added to our talent pool.
          </p>
          <p>
            Space providers, like our pilot partner Pixida, will review profiles based on their needs.
            They (or our recruiting agent on their behalf) will reach out directly if there's a potential match for available space or collaboration opportunities within their hub.
          </p>
          <p>
            In the meantime, feel free to learn more about how ShareYourSpace works.
            You currently have limited access until invited into a specific space.
          </p>
          <Button asChild className="w-full">
            <Link href="/">Return to Homepage</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 