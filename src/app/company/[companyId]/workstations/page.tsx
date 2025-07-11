'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/base';
import { toast } from 'sonner';
import { Workstation } from '@/types/workstation';
import { Skeleton } from '@/components/ui/skeleton';

const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'available':
            return 'default';
        case 'occupied':
            return 'secondary';
        case 'maintenance':
            return 'destructive';
        default:
            return 'outline';
    }
};

const LoadingSkeleton = () => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Space</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Occupant</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);

export default function WorkstationsPage() {
    const params = useParams();
    const companyId = params.companyId;
    const [workstations, setWorkstations] = useState<Workstation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWorkstations = async () => {
            if (!companyId) return;
            setIsLoading(true);
            try {
                const response = await apiClient.get<Workstation[]>('/corp-admin/workstations');
                setWorkstations(response.data);
            } catch (error) {
                toast.error("Failed to load workstations.");
                console.error("Failed to fetch workstations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorkstations();
    }, [companyId]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center">
                            <Users2 className="mr-3 h-6 w-6" />
                            Workstation Management
                        </CardTitle>
                        <CardDescription>Oversee all workstations across all your spaces.</CardDescription>
                    </div>
                    <Button className="mt-4 sm:mt-0">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Workstation
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <LoadingSkeleton />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Space</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Current Occupant</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {workstations.map((ws) => (
                                    <TableRow key={ws.id}>
                                        <TableCell className="font-medium">{ws.name}</TableCell>
                                        <TableCell>{ws.space?.name || 'N/A'}</TableCell>
                                        <TableCell>{ws.type}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(ws.status)}>
                                                {ws.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{ws.current_booking?.user?.full_name || 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">Manage</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
