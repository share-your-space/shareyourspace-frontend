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
import { UserRole, ContactVisibility, StartupStage, TeamSize } from '@/types/enums';
import { Startup } from '@/types/organization';

const mockTenants: Tenant[] = [
	{
		type: 'freelancer',
		id: 'user-diana-prince',
		full_name: 'Diana Prince',
		email: 'diana@freelance.com',
		space_id: null,
		profile: {
			id: 'profile-diana',
			user_id: 'user-diana',
			role: UserRole.FREELANCER,
			first_name: 'Diana',
			last_name: 'Prince',
			full_name: 'Diana Prince',
			title: 'UX/UI Designer',
			bio: 'UX/UI Designer & Prototyping Expert',
			profile_picture_url: 'https://i.pravatar.cc/150?u=diana',
			skills_expertise: ['UX', 'UI', 'Prototyping'],
			industry_focus: ['Design'],
			tools_technologies: ['Figma', 'Sketch'],
			contact_info_visibility: ContactVisibility.PUBLIC,
		},
	},
	{
		type: 'startup',
		id: 'startup-innovate-inc',
		name: 'Innovate Inc.',
		description: 'Building the future of decentralized finance through innovative blockchain solutions.',
		website: 'https://innovate.com',
		profile_image_url: 'https://i.pravatar.cc/150?u=innovate',
		industry_focus: ['FinTech', 'Blockchain'],
		team_size: TeamSize.SMALL,
		stage: StartupStage.SERIES_A,
	},
	{
		type: 'freelancer',
		id: 'user-clark-kent',
		full_name: 'Clark Kent',
		email: 'clark@dailyplanet.com',
		space_id: null,
		profile: {
			id: 'profile-clark',
			user_id: 'user-clark',
			role: UserRole.FREELANCER,
			first_name: 'Clark',
			last_name: 'Kent',
			full_name: 'Clark Kent',
			title: 'Journalist',
			bio: 'Investigative Journalist & Storyteller',
			profile_picture_url: 'https://i.pravatar.cc/150?u=clark',
			skills_expertise: ['Writing', 'Investigation'],
			industry_focus: ['Media'],
			tools_technologies: ['Wordpress', 'Quill'],
			contact_info_visibility: ContactVisibility.PUBLIC,
		},
	},
	{
		type: 'startup',
		id: 'startup-healthify',
		name: 'Healthify',
		description: 'Personalized AI-driven health and wellness platform.',
		website: 'https://healthify.com',
		profile_image_url: 'https://i.pravatar.cc/150?u=healthify',
		industry_focus: ['HealthTech', 'AI'],
		team_size: TeamSize.EXTRA_SMALL,
		stage: StartupStage.SEED,
	},
	{
		type: 'freelancer',
		id: 'user-bruce-wayne',
		full_name: 'Bruce Wayne',
		email: 'bruce@wayne-enterprises.com',
		space_id: null,
		profile: {
			id: 'profile-bruce',
			user_id: 'user-bruce',
			role: UserRole.FREELANCER,
			first_name: 'Bruce',
			last_name: 'Wayne',
			full_name: 'Bruce Wayne',
			title: 'Consultant',
			bio: 'Security Consultant & Gadgeteer',
			profile_picture_url: 'https://i.pravatar.cc/150?u=bruce',
			skills_expertise: ['Security', 'Engineering'],
			industry_focus: ['Security'],
			tools_technologies: ['Custom Hardware'],
			contact_info_visibility: ContactVisibility.PRIVATE,
		},
	},
];


const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

const TenantCard = ({ tenant, onAddToSpace }: { tenant: Tenant, onAddToSpace: (tenant: Tenant) => void }) => {
    const name = tenant.type === 'startup' ? tenant.name : tenant.full_name;
    const description = tenant.type === 'startup' ? tenant.description : tenant.profile?.bio;
    const avatarUrl = tenant.type === 'startup' ? tenant.profile_image_url : tenant.profile?.profile_picture_url;
    const industry = tenant.type === 'startup' ? tenant.industry_focus?.[0] : tenant.profile?.industry_focus?.[0];

    const handleSendMessage = () => {
        const contactName = tenant.type === 'startup' ? tenant.name : tenant.full_name;
        toast.info(`Message sent to ${contactName}`);
    };

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
                    <Button variant="outline" size="sm" onClick={handleSendMessage}><Mail className="mr-2 h-4 w-4" /> Contact</Button>
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
            if (!typeMatch) return false;

            if (searchTerm) {
                const name = tenant.type === 'startup' ? (tenant as Startup).name : tenant.full_name;
                return name?.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return true;
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTenants.map(tenant => (
                        <TenantCard key={tenant.id} tenant={tenant} onAddToSpace={handleAddToSpace} />
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
