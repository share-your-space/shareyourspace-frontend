'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MailCheck } from 'lucide-react';
import Link from 'next/link';

export default function PendingApprovalPage() {
  const router = useRouter();

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit">
            <MailCheck className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl mt-4">Request Sent!</CardTitle>
          <CardDescription>
            The administrator of the organization has been notified. You will receive an email and an in-app notification once your request has been reviewed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            In the meantime, feel free to complete your user profile to help the administrator learn more about you.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button asChild>
              <Link href="/profile">Go to My Profile</Link>
          </Button>
          <Button variant="outline" onClick={() => router.push('/discover')}>
            Explore the Platform
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}