'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Mock Data
const workstations = [
    { id: 'WS-001', type: 'Hot Desk', status: 'Available', occupant: null },
    { id: 'WS-002', type: 'Hot Desk', status: 'Occupied', occupant: 'John Smith' },
    { id: 'PD-01', type: 'Private Desk', status: 'Occupied', occupant: 'Jane Doe' },
    { id: 'PD-02', type: 'Private Desk', status: 'Maintenance', occupant: null },
];

export default function WorkstationsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center">
                            <Users2 className="mr-3 h-6 w-6" />
                            Workstation Management
                        </CardTitle>
                        <CardDescription>Oversee all workstations in your space.</CardDescription>
                    </div>
                    <Button className="mt-4 sm:mt-0">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Workstation
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Current Occupant</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {workstations.map((ws) => (
                                <TableRow key={ws.id}>
                                    <TableCell className="font-medium">{ws.id}</TableCell>
                                    <TableCell>{ws.type}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            ws.status === 'Available' ? 'default' :
                                            ws.status === 'Occupied' ? 'secondary' : 'destructive'
                                        }>
                                            {ws.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{ws.occupant || 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Manage</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
