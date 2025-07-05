"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from '@/types/auth';

interface UserDashboardProps {
  user: User;
}

const UserDashboard = ({ user }: UserDashboardProps) => {
  const isWaitlisted = user.status === 'WAITLISTED';

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {/* Add role-specific primary action, e.g., link to startup profile for STARTUP_ADMIN */}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user.full_name || user.email}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Status:</strong> <span className={isWaitlisted ? "font-semibold text-orange-500" : "text-green-500"}>{user.status}</span></p>
          {/* Add more user-specific info here */}
        </CardContent>
      </Card>

      {isWaitlisted && (
        <Card className="mt-4 border-orange-500">
          <CardHeader>
            <CardTitle className="text-orange-600">You are Currently Waitlisted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your access is currently limited. Full platform features will become available once a space provider invites you. In the meantime, please keep your profile updated.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">My Account</h2>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Manage Your Profile</h3>
            <p className="text-sm text-muted-foreground mb-3">Keep your personal and professional details up to date to attract the best opportunities.</p>
            <Link href="/profile" passHref>
              <Button variant="outline">View/Edit My Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Other role-specific sections like Startup Admin panels can be added here as separate components */}
    </div>
  );
};

export default UserDashboard; 