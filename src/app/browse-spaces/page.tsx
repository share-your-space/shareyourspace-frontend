'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Building } from 'lucide-react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import AuthGuard from '@/components/layout/AuthGuard';
import { useAuthStore } from '@/store/authStore';
import { UserStatus } from '@/types/enums';
import Link from 'next/link';

interface Space {
  id: number;
  name: string;
  address: string | null;
  company_name: string;
  company_id: number | null;
  interest_status: 'interested' | 'not_interested' | 'unavailable';
}

interface SpacesResponse {
    spaces: Space[];
}

export default function BrowseSpacesPage() {
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const user = useAuthStore(state => state.user);

    const fetchSpaces = async () => {
        setLoading(true);
        try {
            const response = await api.get<SpacesResponse>('/spaces/browseable');
            setSpaces(response.data.spaces);
        } catch (error) {
            toast.error("Failed to load spaces.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpaces();
    }, []);

    const handleExpressInterest = async (spaceId: number) => {
        setActionLoading(spaceId);
        try {
            const response = await api.post(`/spaces/${spaceId}/express-interest`);
            toast.success(response.data.message || "Interest expressed successfully!");
            fetchSpaces();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } }, message?: string };
            toast.error("Failed to express interest", {
                description: error.response?.data?.detail || error.message || "An unknown error occurred.",
            });
        } finally {
            setActionLoading(null);
        }
    };
    
    if (loading) {
        return (
            <AuthenticatedLayout>
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthGuard>
            <AuthenticatedLayout>
                <div className="p-4 md:p-8">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold">Browse Spaces</h1>
                        <p className="text-muted-foreground">Discover and express interest in spaces that fit your needs.</p>
                    </header>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {spaces.map(space => (
                            <Card key={space.id} className="flex flex-col justify-between">
                                <div>
                                    <CardHeader>
                                        <CardTitle>{space.name}</CardTitle>
                                        <CardDescription>{space.address || 'No address provided'}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm font-medium text-muted-foreground mb-4">
                                            Operated by: {space.company_name || 'N/A'}
                                        </p>
                                        {space.company_id && (
                                            <Button asChild variant="outline" className="w-full">
                                                <Link href={`/companies/${space.company_id}`}>
                                                    <Building className="mr-2 h-4 w-4" />
                                                    View Company Profile
                                                </Link>
                                            </Button>
                                        )}
                                    </CardContent>
                                </div>
                                <CardFooter>
                                    {space.interest_status === 'interested' ? (
                                        <Button disabled variant="ghost" className="w-full">
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Interest Expressed
                                        </Button>
                                    ) : (
                                        <Button 
                                            onClick={() => handleExpressInterest(space.id)}
                                            disabled={actionLoading === space.id || user?.status !== UserStatus.WAITLISTED}
                                            className="w-full"
                                        >
                                            {actionLoading === space.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Express Interest
                                        </Button>
                                    )}
                                    {user?.status !== UserStatus.WAITLISTED && (
                                        <p className="text-xs text-muted-foreground text-center mt-2">
                                            Only waitlisted users can express interest.
                                        </p>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </AuthenticatedLayout>
        </AuthGuard>
    );
} 