'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, UserPlus, FileDown } from 'lucide-react';
import Link from 'next/link';

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

const MemberCard: React.FC<{ member: Member }> = ({ member }) => {
    return (
        <Card className="transition-shadow hover:shadow-md">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatarUrl} alt={member.fullName} />
                        <AvatarFallback>{getInitials(member.fullName)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{member.fullName}</p>
                        <p className="text-sm text-muted-foreground">{member.title}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {member.status}
                    </span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild><Link href={`/users/${member.id}`}>View Profile</Link></DropdownMenuItem>
                            <DropdownMenuItem>Edit Role</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Remove from Company</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
};

export default function CompanyMembersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredMembers = mockMembers.filter(member =>
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
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
                    filteredMembers.map(member => <MemberCard key={member.id} member={member} />)
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No members found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
