'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Mail, Briefcase, Filter, Loader2, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api/base';
import { Tenant } from '@/types/user';
import { toast } from 'sonner';
import { UserProfile } from '@/types/userProfile';

const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

const TenantCard: React.FC<{ tenant: Tenant, onAddToSpace: (tenant: Tenant) => void }> = ({ tenant, onAddToSpace }) => {
    const name = tenant.type === 'startup' ? tenant.name : tenant.full_name;
    const description = tenant.type === 'startup' ? tenant.mission : (tenant.profile as UserProfile)?.headline;
    const avatarUrl = tenant.type === 'startup' ? tenant.logo_url : (tenant.profile as UserProfile)?.profile_picture_signed_url;
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
                    <Button size="sm" onClick={() => onAddToSpace(tenant)}><Briefcase className="mr-2 h-4 w-4" /> Add to Space</Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default function BrowseTenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const token = useAuthStore((state) => state.token);

    useEffect(() => {
        const fetchTenants = async () => {
            if (!token) {
                setError("Not authenticated.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get('/corp-admin/browse-waitlist', {
                    params: {
                        search: searchTerm,
                        type: typeFilter === 'all' ? undefined : typeFilter,
                    }
                });
                
                const data = response.data.map((item: any) => {
                    if (item.full_name) { // It's a freelancer (User)
                        return { ...item, type: 'freelancer' };
                    } else { // It's a startup
                        return { ...item, type: 'startup' };
                    }
                });

                setTenants(data);
            } catch (error) {
                console.error("Failed to fetch tenants:", error);
                setError("Failed to fetch tenants. Please try again.");
                toast.error("Failed to load potential tenants.");
            } finally {
                setLoading(false);
            }
        };

        const debounceFetch = setTimeout(() => {
            fetchTenants();
        }, 300); // Debounce search input

        return () => clearTimeout(debounceFetch);
    }, [token, searchTerm, typeFilter]);

    const handleAddToSpace = (tenant: Tenant) => {
        // TODO: Implement "Add to Space" modal/dialog
        toast.info(`Preparing to add ${tenant.type === 'startup' ? tenant.name : tenant.full_name} to a space...`);
    };

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
                                placeholder="Search by name, industry, or skills..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-muted-foreground" />
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="freelancer">Freelancers</SelectItem>
                                    <SelectItem value="startup">Startups</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="text-center py-10 text-red-500 flex items-center justify-center gap-2">
                    <AlertCircle className="h-5 w-5" /> {error}
                </div>
            ) : tenants.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    <p>No potential tenants found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {tenants.map((tenant) => (
                        <TenantCard key={`${tenant.type}-${tenant.id}`} tenant={tenant} onAddToSpace={handleAddToSpace} />
                    ))}
                </div>
            )}
        </div>
    );
}
