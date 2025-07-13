'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Colors,
} from 'chart.js';
import { AnalyticsData } from '@/types/analytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Colors
);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        colors: {
            forceOverride: true
        }
    },
};

// Mock Data
const mockAnalyticsData: AnalyticsData = {
    summary: {
        total_tenants: 150,
        total_startups: 45,
        total_freelancers: 105,
        active_connections: 520,
        occupancy_rate: 85.5,
    },
    tenant_growth: [
        { date: '2023-01-01', count: 80 },
        { date: '2023-02-01', count: 95 },
        { date: '2023-03-01', count: 110 },
        { date: '2023-04-01', count: 125 },
        { date: '2023-05-01', count: 140 },
        { date: '2023-06-01', count: 150 },
    ],
    tenant_composition: {
        startups: 45,
        freelancers: 105,
    },
    top_industries: [
        { industry: 'FinTech', count: 25 },
        { industry: 'HealthTech', count: 20 },
        { industry: 'SaaS', count: 18 },
        { industry: 'E-commerce', count: 15 },
        { industry: 'AI/ML', count: 12 },
    ],
};

const AnalyticsPage = () => {
    const analyticsData = mockAnalyticsData;

    const tenantGrowthChartData = {
        labels: analyticsData.tenant_growth.map(d => new Date(d.date).toLocaleString('default', { month: 'short', year: 'numeric' })),
        datasets: [
            {
                label: 'Total Tenants',
                data: analyticsData.tenant_growth.map(d => d.count),
                borderColor: 'hsl(var(--primary))',
                backgroundColor: 'hsla(var(--primary), 0.2)',
                fill: true,
                tension: 0.3,
            },
        ],
    };

    const tenantCompositionChartData = {
        labels: ['Startups', 'Freelancers'],
        datasets: [
            {
                data: [analyticsData.tenant_composition.startups, analyticsData.tenant_composition.freelancers],
                label: 'Tenant Composition',
            },
        ],
    };

    const topIndustriesChartData = {
        labels: analyticsData.top_industries.map(i => i.industry),
        datasets: [
            {
                label: 'Number of Tenants',
                data: analyticsData.top_industries.map(i => i.count),
                barPercentage: 0.5,
                categoryPercentage: 0.5,
            },
        ],
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                <p className="text-muted-foreground">Insights into your community and space utilization.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <Card>
                    <CardHeader><CardTitle>Total Tenants</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{analyticsData.summary.total_tenants}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Startups</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{analyticsData.summary.total_startups}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Freelancers</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{analyticsData.summary.total_freelancers}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Connections</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{analyticsData.summary.active_connections}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Occupancy</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{analyticsData.summary.occupancy_rate}%</p></CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Tenant Growth</CardTitle>
                        <CardDescription>Total number of tenants over the last 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <Line data={tenantGrowthChartData} options={chartOptions} />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Tenant Composition</CardTitle>
                        <CardDescription>Breakdown of startups vs. freelancers.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80 flex items-center justify-center">
                        <Doughnut data={tenantCompositionChartData} options={chartOptions} />
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Top Industries</CardTitle>
                    <CardDescription>Distribution of tenants across different industries.</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                    <Bar data={topIndustriesChartData} options={chartOptions} />
                </CardContent>
            </Card>
        </div>
    );
};

export default AnalyticsPage;
