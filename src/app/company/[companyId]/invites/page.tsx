'use client';

import React, { useState } from 'react';
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
import { toast } from 'sonner';
import { Invitation, InvitationStatus } from '@/types/auth';
import { UserRole } from '@/types/enums';

// Mock Data
const initialMockInvites: Invitation[] = [
    {
        id: 1,
        email: 'pending.user@example.com',
        role: UserRole.CORP_EMPLOYEE,
        status: InvitationStatus.PENDING,
        created_at: '2023-07-10T10:00:00Z',
        expires_at: '2023-07-17T10:00:00Z',
        invitation_token: 'abc-123',
        company_id: 1,
    },
    {
        id: 2,
        email: 'accepted.user@example.com',
        role: UserRole.FREELANCER,
        status: InvitationStatus.ACCEPTED,
        created_at: '2023-07-09T11:30:00Z',
        accepted_at: '2023-07-09T14:00:00Z',
        expires_at: '2023-07-16T11:30:00Z',
        invitation_token: 'def-456',
        company_id: 1,
    },
    {
        id: 3,
        email: 'expired.user@example.com',
        role: UserRole.STARTUP_ADMIN,
        status: InvitationStatus.EXPIRED,
        created_at: '2023-06-01T12:00:00Z',
        expires_at: '2023-06-08T12:00:00Z',
        invitation_token: 'ghi-789',
        company_id: 1,
    },
];

const getStatusBadgeVariant = (status: InvitationStatus) => {
    switch (status) {
        case InvitationStatus.PENDING: return 'secondary';
        case InvitationStatus.ACCEPTED: return 'success';
        case InvitationStatus.EXPIRED: return 'destructive';
        case InvitationStatus.REVOKED: return 'outline';
        default: return 'default';
    }
};

export default function InvitesPage() {
    const params = useParams();
    const companyId = Number(params.companyId);
    const [invites, setInvites] = useState<Invitation[]>(initialMockInvites);
    const [newInviteEmail, setNewInviteEmail] = useState('');
    const [newInviteRole, setNewInviteRole] = useState<UserRole>(UserRole.CORP_EMPLOYEE);

    const handleSendInvite = () => {
        if (!newInviteEmail || !/^\S+@\S+\.\S+$/.test(newInviteEmail)) {
            toast.warning("Please enter a valid email address.");
            return;
        }

        const newInvite: Invitation = {
            id: Math.max(...invites.map(i => i.id), 0) + 1,
            email: newInviteEmail,
            role: newInviteRole,
            status: InvitationStatus.PENDING,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            invitation_token: `tok-${Math.random().toString(36).substr(2, 9)}`,
            company_id: companyId,
        };

        setInvites(prev => [newInvite, ...prev]);
        toast.success(`Invitation sent to ${newInviteEmail}`);
        setNewInviteEmail('');
    };

    const handleResendInvite = (inviteId: number) => {
        setInvites(prev => prev.map(inv => inv.id === inviteId ? { ...inv, created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() } : inv));
        const invite = invites.find(i => i.id === inviteId);
        toast.success(`Invitation for ${invite?.email} has been resent.`);
    };

    const handleRevokeInvite = (inviteId: number) => {
        setInvites(prev => prev.filter(inv => inv.id !== inviteId));
        const invite = invites.find(i => i.id === inviteId);
        toast.info(`Invitation for ${invite?.email} has been revoked.`);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><UserPlus className="mr-2" /> Send New Invitation</CardTitle>
                    <CardDescription>Invite new members to join your company on ShareYourSpace.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="name@example.com" value={newInviteEmail} onChange={e => setNewInviteEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={newInviteRole} onValueChange={(value) => setNewInviteRole(value as UserRole)}>
                            <SelectTrigger id="role">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={UserRole.CORP_EMPLOYEE}>Employee</SelectItem>
                                <SelectItem value={UserRole.FREELANCER}>Freelancer</SelectItem>
                                <SelectItem value={UserRole.STARTUP_ADMIN}>Startup Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleSendInvite} className="w-full md:w-auto">
                        <Mail className="mr-2 h-4 w-4" /> Send Invite
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pending & Past Invitations</CardTitle>
                    <CardDescription>Track the status of invitations you&apos;ve sent.</CardDescription>
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
                            {invites.length > 0 ? invites.map((invite) => (
                                <TableRow key={invite.id}>
                                    <TableCell className="font-medium">{invite.email}</TableCell>
                                    <TableCell>{invite.role}</TableCell>
                                    <TableCell>{new Date(invite.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(invite.status)}>{invite.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {invite.status === InvitationStatus.PENDING && (
                                            <>
                                                <Button variant="ghost" size="icon" onClick={() => handleResendInvite(invite.id)} title="Resend Invite">
                                                    <RefreshCw className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleRevokeInvite(invite.id)} title="Revoke Invite">
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">No invitations found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
