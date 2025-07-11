'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserPlus, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';

// Mock Data
const pendingInvites = [
    { email: 'new.dev@example.com', role: 'Member', dateSent: '2024-07-10', status: 'Pending' },
    { email: 'lead.designer@example.com', role: 'Member', dateSent: '2024-07-09', status: 'Pending' },
    { email: 'external.consultant@example.com', role: 'Admin', dateSent: '2024-07-05', status: 'Expired' },
];

export default function InvitesPage() {
    return (
        <div className="space-y-8">
            {/* Invite New Member Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <UserPlus className="mr-3 h-6 w-6" />
                        Invite New Member or Admin
                    </CardTitle>
                    <CardDescription>They will receive an email with instructions to join your company.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row items-end gap-4">
                        <div className="w-full space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" placeholder="name@company.com" />
                        </div>
                        <div className="w-full md:w-auto space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="w-full md:w-auto">
                            <Mail className="mr-2 h-4 w-4" />
                            Send Invitation
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Pending Invites Section */}
            <Card>
                 <CardHeader>
                    <CardTitle>Pending Invitations</CardTitle>
                    <CardDescription>These invitations have been sent but not yet accepted.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Date Sent</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingInvites.map((invite) => (
                                <TableRow key={invite.email}>
                                    <TableCell className="font-medium">{invite.email}</TableCell>
                                    <TableCell>{invite.role}</TableCell>
                                    <TableCell>{invite.dateSent}</TableCell>
                                    <TableCell>
                                        <Badge variant={invite.status === 'Pending' ? 'default' : 'outline'}>
                                            {invite.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Resend</Button>
                                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Cancel</Button>
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
