'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PendingOnboardingPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Thank You for Your Interest!</CardTitle>
          <CardDescription>Corporate Account Pending Onboarding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Your registration is complete and your email has been verified.
          </p>
          <p>
            A member of the ShareYourSpace team will reach out to your provided contact information within the next 24 business hours.
            We'll discuss the next steps for onboarding your company, configuring your space profile, and setting up your Corporate Admin access.
          </p>
          <p>
            We're excited to potentially partner with you!
          </p>
          <Button asChild className="w-full">
            <Link href="/">Return to Homepage</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 