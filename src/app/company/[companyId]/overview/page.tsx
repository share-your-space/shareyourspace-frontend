"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api/base';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";
import { Building, Briefcase, Users, UserCheck, Mail, CalendarCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { PaginatedActivityResponse, Activity } from '@/types/activity';

interface DashboardStats {
  total_spaces: number;
  total_workstations: number;
  occupied_workstations: number;
  total_tenants: number;
  pending_invites: number;
  active_bookings: number;
}

const RecentActivity = ({ companyId }: { companyId: string | string[] }) => {
    const [activity, setActivity] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (companyId) {
            const fetchActivity = async () => {
                setIsLoading(true);
                try {
                    const response = await apiClient.get<PaginatedActivityResponse>(`/company/${companyId}/dashboard/activity?limit=7`);
                    setActivity(response.data.activities);
                } catch (error) {
                    toast.error('Failed to load recent activity.');
                    console.error("Failed to fetch activity:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchActivity();
        }
    }, [companyId]);

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-3 w-[150px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activity.length > 0 ? (
                    <div className="space-y-6">
                        {activity.map((item) => (
                            <div key={item.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={item.user_avatar_url} alt="Avatar" />
                                    <AvatarFallback>{item.type.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {item.link ? <Link href={item.link} className="hover:underline">{item.description}</Link> : item.description}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        No recent activity to display.
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const StatCard = ({ title, value, icon: Icon, isLoading, description }: { title: string, value: string | number, icon: LucideIcon, isLoading: boolean, description?: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <Skeleton className="h-8 w-20" />
            ) : (
                <div className="text-2xl font-bold">{value}</div>
            )}
            {description && !isLoading && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
);

const CompanyDashboardOverviewPage = () => {
    const params = useParams();
    const companyId = params.companyId;
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (companyId) {
            const fetchStats = async () => {
                setIsLoading(true);
                try {
                    // The endpoint is not company-specific in the backend yet, but we call it when a companyId is present.
                    const response = await apiClient.get<DashboardStats>(`/company/${companyId}/dashboard/stats`);
                    setStats(response.data);
                } catch (error) {
                    toast.error('Failed to load dashboard statistics.');
                    console.error("Failed to fetch dashboard stats:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchStats();
        }
    }, [companyId]);

    const workstationOccupancy = stats && stats.total_workstations > 0
        ? (stats.occupied_workstations / stats.total_workstations) * 100
        : 0;

    const statCards = [
        { title: "Total Spaces", value: stats?.total_spaces, icon: Building, isLoading, description: "All managed spaces" },
        { title: "Total Workstations", value: stats?.total_workstations, icon: Briefcase, isLoading, description: "Across all spaces" },
        { title: "Active Tenants", value: stats?.total_tenants, icon: Users, isLoading, description: "Users in your spaces" },
        { title: "Pending Invites", value: stats?.pending_invites, icon: Mail, isLoading, description: "Awaiting user response" },
        { title: "Active Bookings", value: stats?.active_bookings, icon: CalendarCheck, isLoading, description: "Current workstation bookings" },
        { title: "Occupied Workstations", value: stats?.occupied_workstations, icon: UserCheck, isLoading, description: "Currently assigned workstations" },
    ];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {statCards.map((card, index) => (
                    <StatCard
                        key={index}
                        title={card.title}
                        value={card.value ?? '...'}
                        icon={card.icon}
                        isLoading={isLoading}
                        description={card.description}
                    />
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Workstation Occupancy</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                         {isLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                         ) : (
                            <>
                                <p className="text-sm text-muted-foreground mb-2">
                                    {stats?.occupied_workstations} of {stats?.total_workstations} workstations are occupied.
                                </p>
                                <Progress value={workstationOccupancy} className="w-full" />
                            </>
                         )}
                    </CardContent>
                </Card>
                <RecentActivity companyId={companyId} />
            </div>
        </div>
    );
};

export default CompanyDashboardOverviewPage;
