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
import { MoreHorizontal, UserPlus } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mockInvites = [
    {
        id: '1',
        email: 'new.hire@example.com',
        role: 'Member',
        status: 'Pending',
        sentAt: '2025-07-11T09:00:00Z',
    },
    {
        id: '2',
        email: 'another.dev@example.com',
        role: 'Member',
        status: 'Pending',
        sentAt: '2025-07-10T14:00:00Z',
    },
    {
        id: '3',
        email: 'accepted.user@example.com',
        role: 'Admin',
        status: 'Accepted',
        sentAt: '2025-07-09T11:00:00Z',
    },
];

const InvitesPage = () => {
    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Manage Invites</CardTitle>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Send Invite
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="bg-background rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Sent At</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockInvites.map((invite) => (
                                    <TableRow key={invite.id}>
                                        <TableCell className="font-medium">{invite.email}</TableCell>
                                        <TableCell>{invite.role}</TableCell>
                                        <TableCell>
                                            <Badge variant={invite.status === 'Pending' ? 'destructive' : 'default'}>
                                                {invite.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(invite.sentAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost" disabled={invite.status === 'Accepted'}>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem>Resend Invite</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600">Cancel Invite</DropdownMenuItem>
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
};

export default InvitesPage;
