"use client";

import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Search, UserPlus, FileDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Types
interface Member {
    id: number;
    fullName: string;
    title: string;
    email: string;
    avatarUrl?: string;
    status: 'Active' | 'Pending';
    role: 'Admin' | 'Member';
}

const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

// Mock Data
const mockMembers: Member[] = [
    { id: 1, fullName: 'Jane Doe', title: 'CEO', email: 'jane.doe@company.com', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', status: 'Active', role: 'Admin' },
    { id: 2, fullName: 'John Smith', title: 'Lead Developer', email: 'john.smith@company.com', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d', status: 'Active', role: 'Member' },
    { id: 3, fullName: 'Peter Jones', title: 'Marketing Manager', email: 'peter.jones@company.com', status: 'Active', role: 'Member' },
    { id: 4, fullName: 'Mary Jane', title: 'UX Designer', email: 'mary.jane@company.com', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706d', status: 'Active', role: 'Member' },
    { id: 5, fullName: 'pending.invite@company.com', title: 'Pending Invite', email: 'pending.invite@company.com', status: 'Pending', role: 'Member' },
];

export default function CompanyMembersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredMembers = mockMembers.filter(member =>
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Manage Members</CardTitle>
                            <p className="text-muted-foreground mt-1">View, manage, and invite members to your company.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline"><FileDown className="mr-2 h-4 w-4" /> Export</Button>
                            <Button><UserPlus className="mr-2 h-4 w-4" /> Invite Member</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-10 w-full sm:w-80"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {filteredMembers.length > 0 ? (
                    <div className="bg-background rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMembers.map(member => (
                                    <TableRow key={member.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={member.avatarUrl} alt={member.fullName} />
                                                    <AvatarFallback>{getInitials(member.fullName)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{member.fullName}</p>
                                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{member.role}</TableCell>
                                        <TableCell>
                                            <Badge variant={member.status === 'Active' ? 'default' : 'outline'}>
                                                {member.status}
                                            </Badge>
                                        </TableCell>
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
                                                    <DropdownMenuItem>Edit Role</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600">Remove from Company</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No members found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
