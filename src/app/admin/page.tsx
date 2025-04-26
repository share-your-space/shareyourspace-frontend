'use client';

import React from 'react';
import Link from 'next/link';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminDashboardPage() {

    return (
        <AuthenticatedLayout>
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Corporate Onboarding</CardTitle>
                        <CardDescription>Review and approve pending corporate signups.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/admin/pending-corporates" passHref>
                           <Button>View Pending Corporates</Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Add more admin cards here later for users, spaces, stats etc. */}

                 <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>View and manage platform users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Button disabled>View Users (Coming Soon)</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Space Management</CardTitle>
                        <CardDescription>View and manage configured spaces.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button disabled>View Spaces (Coming Soon)</Button>
                    </CardContent>
                </Card>

            </div>
        </AuthenticatedLayout>
    );
} 