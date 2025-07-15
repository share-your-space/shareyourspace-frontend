'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, UserPlus, FileDown } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types/enums';
import { User } from '@/types/auth';
import { Startup } from '@/types/organization';

// Mock Data
const mockUsers: User[] = [
  {
    id: 'user-101',
    full_name: 'Alice Johnson',
    email: 'alice.j@innovate.io',
    role: UserRole.FREELANCER,
    status: 'ACTIVE',
    is_active: true,
    created_at: '2023-01-15T09:30:00Z',
    updated_at: '2023-01-15T09:30:00Z',
    profile_picture_url: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=1974&auto=format&fit=crop',
  },
  {
    id: 'user-102',
    full_name: 'Bob Williams',
    email: 'bob.w@synergy.co',
    role: UserRole.FREELANCER,
    status: 'ACTIVE',
    is_active: true,
    created_at: '2023-02-20T11:00:00Z',
    updated_at: '2023-02-20T11:00:00Z',
    profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
  },
];

const mockStartups: Startup[] = [
  {
    id: 'startup-201',
    name: 'Innovate Inc.',
    description: 'Pioneering new technologies.',
    website: 'https://innovate.io',
    industry_focus: ['Technology'],
    profile_image_url: 'https://images.unsplash.com/photo-1556761175-577389e7a4c8?q=80&w=2070&auto=format&fit=crop',
    type: 'startup',
  },
  {
    id: 'startup-202',
    name: 'Synergy Solutions',
    description: 'Connecting ideas and people.',
    website: 'https://synergy.co',
    industry_focus: ['Consulting'],
    profile_image_url: 'https://images.unsplash.com/photo-1562575214-da9fcf59b907?q=80&w=1974&auto=format&fit=crop',
    type: 'startup',
  },
];

type Tenant = User | Startup;

const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

const MemberCard: React.FC<{ member: Tenant }> = ({ member }) => {
    const isUser = 'email' in member;
    const name = isUser ? (member as User).full_name : (member as Startup).name;
    const avatarUrl = isUser ? (member as User).profile_picture_url : (member as Startup).profile_image_url;
    const title = isUser ? (member as User).role : (member as Startup).description;
    const status = isUser ? (member as User).status : 'Active'; // Startups are always active

    const handleAction = (action: string) => {
        toast.info(`Action: "${action}" on "${name}"`);
    };

    return (
        <Card className="transition-shadow hover:shadow-md">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={avatarUrl || undefined} alt={name || 'avatar'} />
                        <AvatarFallback>{getInitials(name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{name}</p>
                        <p className="text-sm text-muted-foreground">{title}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <Badge variant={status === 'ACTIVE' ? 'success' : 'secondary'}>{status}</Badge>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/${isUser ? 'users' : 'startups'}/${member.id}`}>View Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('Edit Role')}>Edit Role</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('Remove from Company')} className="text-red-600">Remove from Company</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
};

export default function CompanyMembersPage() {
    const params = useParams();
    const companyId = params.companyId;
    const [searchTerm, setSearchTerm] = useState('');
    
    const allMembers: Tenant[] = useMemo(() => [...mockUsers, ...mockStartups], []);

    const filteredMembers = useMemo(() => {
        if (!searchTerm) return allMembers;
        return allMembers.filter(member => {
            const name = 'email' in member ? (member as User).full_name : (member as Startup).name;
            return name?.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [searchTerm, allMembers]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Company Members</h1>
                    <p className="text-muted-foreground">Manage users and startups associated with your company.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><FileDown className="mr-2 h-4 w-4" /> Export CSV</Button>
                    <Link href={`/company/${companyId}/invites`}>
                        <Button><UserPlus className="mr-2 h-4 w-4" /> Invite Member</Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search by name..."
                            className="pl-10"
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
                    <p className="text-center text-muted-foreground py-8">No members found.</p>
                )}
            </div>
        </div>
    );
}
