'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
          <CardTitle className="text-2xl">Join ShareYourSpace</CardTitle>
          <CardDescription>How would you like to get started?</CardDescription>
          </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Link href="/signup/freelancer" passHref>
            <Button variant="outline" className="w-full">
              Sign Up as an Individual / Freelancer
            </Button>
          </Link>
          <Link href="/signup/startup-admin" passHref>
            <Button variant="outline" className="w-full">
              Register a Startup
            </Button>
          </Link>
          <Link href="/signup/corporate-admin" passHref>
            <Button variant="outline" className="w-full">
              Register a Company
              </Button>
          </Link>
          </CardContent>
        </Card>
      </div>
  );
}