"use client";

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock Data
const workstations = [
    { id: 'WS-001', type: 'Hot Desk', status: 'Available', occupant: null },
    { id: 'WS-002', type: 'Hot Desk', status: 'Occupied', occupant: 'John Smith' },
    { id: 'PD-01', type: 'Private Desk', status: 'Occupied', occupant: 'Jane Doe' },
    { id: 'PD-02', type: 'Private Desk', status: 'Maintenance', occupant: null },
];

export default function WorkstationsPage() {
    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Manage Workstations</CardTitle>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Workstation
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="bg-background rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Workstation</TableHead>
                                    <TableHead>Space</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Current Tenant</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
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
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem>Assign Tenant</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
