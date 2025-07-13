'use client';

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Mail, Briefcase, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tenant } from '@/types/user';
import { toast } from 'sonner';
import { UserProfile } from '@/types/userProfile';
import { UserRole } from '@/types/auth';
import { Startup } from '@/types/organization';

const mockTenants: Tenant[] = [
	{
		type: 'freelancer',
		id: 1,
		full_name: 'Diana Prince',
		email: 'diana@freelance.com',
		space_id: null,
		profile: {
			id: 1,
			user_id: 1,
			role: UserRole.FREELANCER,
			full_name: 'Diana Prince',
			headline: 'UX/UI Designer & Prototyping Expert',
			industry: 'Design',
			profile_picture_url: 'https://i.pravatar.cc/150?u=diana',
			is_profile_complete: true,
		},
	},
	{
		type: 'startup',
		id: 101,
		name: 'Innovate Inc.',
		mission: 'Building the future of decentralized finance through innovative blockchain solutions.',
		logo_url: 'https://i.pravatar.cc/150?u=innovate',
		industry_focus: ['FinTech', 'Blockchain'],
		team_size: 15,
		stage: 'Series A',
	},
	{
		type: 'freelancer',
		id: 2,
		full_name: 'Clark Kent',
		email: 'clark@dailyplanet.com',
		space_id: null,
		profile: {
			id: 2,
			user_id: 2,
			role: UserRole.FREELANCER,
			full_name: 'Clark Kent',
			headline: 'Investigative Journalist & Storyteller',
			industry: 'Media',
			profile_picture_url: 'https://i.pravatar.cc/150?u=clark',
			is_profile_complete: true,
		},
	},
	{
		type: 'startup',
		id: 102,
		name: 'Healthify',
		mission: 'Personalized AI-driven health and wellness platform.',
		logo_url: 'https://i.pravatar.cc/150?u=healthify',
		industry_focus: ['HealthTech', 'AI'],
		team_size: 8,
		stage: 'Seed',
	},
	{
		type: 'freelancer',
		id: 3,
		full_name: 'Bruce Wayne',
		email: 'bruce@wayne-enterprises.com',
		space_id: null,
		profile: {
			id: 3,
			user_id: 3,
			role: UserRole.FREELANCER,
			full_name: 'Bruce Wayne',
			headline: 'Security Consultant & Gadgeteer',
			industry: 'Security',
			profile_picture_url: 'https://i.pravatar.cc/150?u=bruce',
			is_profile_complete: true,
		},
	},
];


const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

const TenantCard: React.FC<{ tenant: Tenant, onAddToSpace: (tenant: Tenant) => void }> = ({ tenant, onAddToSpace }) => {
    const name = tenant.type === 'startup' ? tenant.name : tenant.full_name;
    const description = tenant.type === 'startup' ? tenant.mission : (tenant.profile as UserProfile)?.headline;
    const avatarUrl = tenant.type === 'startup' ? tenant.logo_url : (tenant.profile as UserProfile)?.profile_picture_url;
    const industry = tenant.type === 'startup' ? tenant.industry_focus?.[0] : (tenant.profile as UserProfile)?.industry;

    return (
        <Card className="transition-shadow hover:shadow-lg">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border">
                        <AvatarImage src={avatarUrl || undefined} alt={name || 'tenant'} />
                        <AvatarFallback>{getInitials(name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg">{name}</h3>
                                {industry && <p className="text-sm text-primary font-semibold">{industry}</p>}
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${tenant.type === 'startup' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                {tenant.type}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 h-10 overflow-hidden">{description || 'No description available.'}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm"><Mail className="mr-2 h-4 w-4" /> Contact</Button>
                    <Button size="sm" onClick={() => onAddToSpace(tenant)}><Briefcase className="mr-2 h-4 w-4" /> Add to Waitlist</Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default function BrowseTenantsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const handleAddToSpace = (tenant: Tenant) => {
        const name = tenant.type === 'startup' ? tenant.name : tenant.full_name;
        toast.success(`${name} has been added to your space's waitlist.`);
    };

    const filteredTenants = useMemo(() => {
        return mockTenants.filter(tenant => {
            const typeMatch = typeFilter === 'all' || tenant.type === typeFilter;

            const searchMatch = searchTerm.trim() === '' ||
                (tenant.type === 'startup' && (tenant as Startup).name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (tenant.type === 'freelancer' && tenant.full_name && tenant.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

            return typeMatch && searchMatch;
        });
    }, [searchTerm, typeFilter]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Browse Potential Tenants</h1>
                    <p className="text-muted-foreground">Discover and connect with startups and freelancers.</p>
                </div>
                <Button>
                    <Filter className="mr-2 h-4 w-4" />
                    Advanced Filters
                </Button>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search by name..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="freelancer">Freelancers</SelectItem>
                                <SelectItem value="startup">Startups</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {filteredTenants.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredTenants.map(tenant => (
                        <TenantCard key={`${tenant.type}-${tenant.id}`} tenant={tenant} onAddToSpace={handleAddToSpace} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-lg font-semibold">No tenants found</p>
                    <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
}
