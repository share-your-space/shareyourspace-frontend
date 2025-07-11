"use client";

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/base';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, Briefcase, Mail, BarChart2, Activity } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DashboardStats {
    total_spaces: number;
    total_workstations: number;
    occupied_workstations: number;
    total_tenants: number;
    pending_invites: number;
}

const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: React.ElementType, description: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

const OverviewPage = ({ params }: { params: { companyId: string } }) => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await apiClient.get<DashboardStats>(`/corp-admin/dashboard/stats`);
                setStats(response.data);
            } catch (error) {
                toast.error('Failed to load dashboard data.');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [params.companyId]);

    const workstationsData = {
        labels: ['Workstations'],
        datasets: [
            {
                label: 'Occupied',
                data: [stats?.occupied_workstations || 0],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
            {
                label: 'Available',
                data: [(stats?.total_workstations || 0) - (stats?.occupied_workstations || 0)],
                backgroundColor: 'rgba(201, 203, 207, 0.6)',
            },
        ],
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!stats) {
        return <div>Could not load dashboard statistics.</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Spaces" value={stats.total_spaces} icon={Building} description="All managed spaces" />
                <StatCard title="Total Workstations" value={stats.total_workstations} icon={Briefcase} description="All available workstations" />
                <StatCard title="Active Tenants" value={stats.total_tenants} icon={Users} description="Users occupying workstations" />
                <StatCard title="Pending Invites" value={stats.pending_invites} icon={Mail} description="Invitations awaiting response" />
            </div>
            <div className="grid gap-4 mt-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <BarChart2 className="mr-2 h-5 w-5" />
                            Workstation Occupancy
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div style={{ height: '300px' }}>
                            <Bar data={workstationsData} options={{ maintainAspectRatio: false, indexAxis: 'y' }} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Activity className="mr-2 h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Placeholder for activity feed */}
                        <p className="text-muted-foreground">Activity feed coming soon.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OverviewPage;
