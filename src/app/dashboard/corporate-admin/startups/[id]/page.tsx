'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Startup } from '@/types/organization';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import StartupProfileDisplay from '@/components/organization/StartupProfileDisplay';

export default function ManageStartupPage() {
    const { id: startupId } = useParams();
    const [startup, setStartup] = useState<Startup | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [approvedSlots, setApprovedSlots] = useState<number>(0);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchStartup = useCallback(async () => {
        if (!startupId) return;
        setIsLoading(true);
        try {
            const response = await api.get(`/organizations/startups/${startupId}`);
            setStartup(response.data);
            setApprovedSlots(response.data.approved_member_slots || 0);
        } catch (err) {
            setError('Failed to fetch startup details.');
        } finally {
            setIsLoading(false);
        }
    }, [startupId]);

    useEffect(() => {
        fetchStartup();
    }, [fetchStartup]);

    const handleUpdateSlots = async () => {
        setIsUpdating(true);
        try {
            const response = await api.put(`/admin/startups/${startupId}`, {
                approved_member_slots: approvedSlots,
            });
            setStartup(response.data);
            toast.success("Approved member slots updated successfully.");
        } catch (err) {
            toast.error("Failed to update approved member slots.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!startup) return <p>Startup not found.</p>;

    return (
        <AuthenticatedLayout>
            <div className="p-4 md:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold">Manage: {startup.name}</h1>
                    <p className="text-muted-foreground">
                        View startup details and manage their member slots.
                    </p>
                </header>

                <div className="grid gap-8 lg:grid-cols-2">
                    <StartupProfileDisplay startup={startup} isLoading={isLoading} error={error} />
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Member Management</CardTitle>
                            <CardDescription>
                                Set the number of members this startup can add without your approval.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="approved-slots">Approved Member Slots</Label>
                                <Input
                                    id="approved-slots"
                                    type="number"
                                    value={approvedSlots}
                                    onChange={(e) => setApprovedSlots(parseInt(e.target.value, 10))}
                                    min="0"
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleUpdateSlots} disabled={isUpdating}>
                                {isUpdating ? 'Updating...' : 'Update Slots'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 