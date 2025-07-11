'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, UserPlus, FileDown } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/base';
import { toast } from 'sonner';
import { User } from '@/types/auth';
import { Startup } from '@/types/organization';
import { Skeleton } from '@/components/ui/skeleton';

type Tenant = User | Startup;

const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

const MemberCard: React.FC<{ member: Tenant }> = ({ member }) => {
    const isUser = 'full_name' in member;
    const name = isUser ? member.full_name : member.name;
    const email = isUser ? member.email : (member.contact_email || 'N/A');
    const avatarUrl = isUser ? member.profile?.profile_picture_signed_url : member.profile?.logo_signed_url;
    const title = isUser ? member.profile?.title : 'Startup';
    const status = isUser ? member.status : 'Active'; // Startups are always active if they are tenants

    return (
        <Card className="transition-shadow hover:shadow-md">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={avatarUrl || undefined} alt={name || ''} />
                        <AvatarFallback>{getInitials(name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{name}</p>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-xs text-muted-foreground">{email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {status}
                    </span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild><Link href={`/${isUser ? 'users' : 'startups'}/${member.id}`}>View Profile</Link></DropdownMenuItem>
                            <DropdownMenuItem>Edit Role</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Remove from Company</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
};

const LoadingSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <Card key={i}>
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                    </div>
                    <Skeleton className="h-8 w-20" />
                </CardContent>
            </Card>
        ))}
    </div>
);


export default function CompanyMembersPage() {
    const params = useParams();
    const companyId = params.companyId;
    const [searchTerm, setSearchTerm] = useState('');
    const [members, setMembers] = useState<Tenant[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            if (!companyId) return;
            setIsLoading(true);
            try {
                // Fetch both tenants (freelancers, startups) and company employees (corp-admins)
                const tenantsPromise = apiClient.get<Tenant[]>(`/corp-admin/tenants`);
                const employeesPromise = apiClient.get<User[]>(`/corp-admin/company-members`);
                
                const [tenantsResponse, employeesResponse] = await Promise.all([tenantsPromise, employeesPromise]);

                // Combine and remove duplicates (e.g., a user could be both an employee and a tenant in a weird case)
                const allMembers = new Map<string, Tenant>();
                
                employeesResponse.data.forEach(m => allMembers.set(`user-${m.id}`, m));
                tenantsResponse.data.forEach(t => {
                    const key = 'full_name' in t ? `user-${t.id}` : `startup-${t.id}`;
                    if (!allMembers.has(key)) {
                        allMembers.set(key, t);
                    }
                });

                setMembers(Array.from(allMembers.values()));

            } catch (error) {
                toast.error("Failed to load company members.");
                console.error("Failed to fetch members:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMembers();
    }, [companyId]);

    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const name = 'full_name' in member ? member.full_name : member.name;
            const email = 'full_name' in member ? member.email : member.contact_email;
            return (name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                   (email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        });
    }, [members, searchTerm]);

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

            {isLoading ? (
                <LoadingSkeleton />
            ) : filteredMembers.length > 0 ? (
                <div className="space-y-4">
                    {filteredMembers.map(member => {
                        const key = 'full_name' in member ? `user-${member.id}` : `startup-${member.id}`;
                        return <MemberCard key={key} member={member} />;
                    })}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No members found.</p>
                </div>
            )}
        </div>
    );
}
