'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserPlus, Mail, RefreshCw, XCircle } from 'lucide-react';
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
import { apiClient } from '@/lib/api/base';
import { toast } from 'sonner';
import { Invitation } from '@/types/invitation';
import { Skeleton } from '@/components/ui/skeleton';
import { UserRole } from '@/types/enums';

const LoadingSkeleton = () => (
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
            {[...Array(3)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell className="text-right space-x-2">
                        <Skeleton className="h-8 w-8 inline-block" />
                        <Skeleton className="h-8 w-8 inline-block" />
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);

export default function InvitesPage() {
    const params = useParams();
    const companyId = params.companyId;
    const [invites, setInvites] = useState<Invitation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newInviteEmail, setNewInviteEmail] = useState('');
    const [newInviteRole, setNewInviteRole] = useState<UserRole>(UserRole.CORP_EMPLOYEE);

    const fetchInvites = useCallback(async () => {
        if (!companyId) return;
        setIsLoading(true);
        try {
            const response = await apiClient.get<Invitation[]>('/corp-admin/invites');
            setInvites(response.data);
        } catch (error) {
            toast.error("Failed to load invitations.");
            console.error("Failed to fetch invites:", error);
        } finally {
            setIsLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        fetchInvites();
    }, [fetchInvites]);

    const handleSendInvite = async () => {
        if (!newInviteEmail) {
            toast.warning("Please enter an email address.");
            return;
        }
        try {
            await apiClient.post('/invitations/invite-user', {
                email: newInviteEmail,
                role: newInviteRole,
                company_id: Number(companyId)
            });
            toast.success(`Invitation sent to ${newInviteEmail}`);
            setNewInviteEmail('');
            fetchInvites(); // Refresh the list
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } };
            toast.error(err.response?.data?.detail || "Failed to send invitation.");
        }
    };

    const handleCancelInvite = async (inviteId: number) => {
        try {
            await apiClient.delete(`/invitations/${inviteId}`);
            toast.success("Invitation cancelled.");
            fetchInvites(); // Refresh the list
        } catch (error) {
            toast.error("Failed to cancel invitation.");
            console.error("Failed to cancel invitation:", error);
        }
    };

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
                            <Input id="email" type="email" placeholder="name@company.com" value={newInviteEmail} onChange={(e) => setNewInviteEmail(e.target.value)} />
                        </div>
                        <div className="w-full md:w-auto space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={newInviteRole} onValueChange={(value) => setNewInviteRole(value as UserRole)}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={UserRole.CORP_EMPLOYEE}>Member</SelectItem>
                                    <SelectItem value={UserRole.CORP_ADMIN}>Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="w-full md:w-auto" onClick={handleSendInvite}>
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
                    {isLoading ? <LoadingSkeleton /> : (
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
                            {invites.map((invite: Invitation) => (
                                <TableRow key={invite.id}>
                                    <TableCell className="font-medium">{invite.email}</TableCell>
                                    <TableCell>{invite.role}</TableCell>
                                    <TableCell>{new Date(invite.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={invite.status.toLowerCase() === 'pending' ? 'default' : 'outline'}>
                                            {invite.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" title="Resend Invitation" disabled>
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" title="Cancel Invitation" onClick={() => handleCancelInvite(invite.id)}>
                                            <XCircle className="h-4 w-4 text-destructive" />
                                        </Button>
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
