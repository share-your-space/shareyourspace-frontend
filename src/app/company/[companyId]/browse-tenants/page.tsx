'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Mail, Briefcase, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Types
interface Tenant {
    id: number;
    name: string;
    type: 'Startup' | 'Freelancer';
    industry: string;
    avatarUrl?: string;
    shortDescription: string;
}

const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

// Mock Data
const mockTenants: Tenant[] = [
    { id: 1, name: 'AI Innovators', type: 'Startup', industry: 'Artificial Intelligence', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', shortDescription: 'Developing next-gen AI solutions for enterprise.' },
    { id: 2, name: 'Alex Ray', type: 'Freelancer', industry: 'Web Development', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d', shortDescription: 'Full-stack developer specializing in React and Node.js.' },
    { id: 3, name: 'GreenTech Solutions', type: 'Startup', industry: 'Sustainability', shortDescription: 'Building smart solutions for a greener planet.' },
    { id: 4, name: 'Creative Canvas', type: 'Freelancer', industry: 'Graphic Design', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706d', shortDescription: 'Branding and visual identity expert.' },
];

const TenantCard: React.FC<{ tenant: Tenant }> = ({ tenant }) => {
    return (
        <Card className="transition-shadow hover:shadow-lg">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border">
                        <AvatarImage src={tenant.avatarUrl} alt={tenant.name} />
                        <AvatarFallback>{getInitials(tenant.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg">{tenant.name}</h3>
                                <p className="text-sm text-primary font-semibold">{tenant.industry}</p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${tenant.type === 'Startup' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                {tenant.type}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{tenant.shortDescription}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm"><Mail className="mr-2 h-4 w-4" /> Contact</Button>
                    <Button size="sm"><Briefcase className="mr-2 h-4 w-4" /> Add to Space</Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default function BrowseTenantsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredTenants = mockTenants.filter(tenant =>
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.industry.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Browse Potential Tenants</CardTitle>
                    <CardDescription>Discover and connect with waitlisted startups and freelancers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or industry..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-muted-foreground" />
                            <Select>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="startup">Startups</SelectItem>
                                    <SelectItem value="freelancer">Freelancers</SelectItem>
                                </SelectContent>
                            </Select>
                             <Select>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by Industry" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Industries</SelectItem>
                                    <SelectItem value="ai">Artificial Intelligence</SelectItem>
                                    <SelectItem value="sustainability">Sustainability</SelectItem>
                                    <SelectItem value="webdev">Web Development</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {filteredTenants.length > 0 ? (
                    filteredTenants.map(tenant => <TenantCard key={tenant.id} tenant={tenant} />)
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No tenants found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
