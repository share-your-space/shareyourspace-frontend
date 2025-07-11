'use client';

import React, { useEffect, useState } from 'react';
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
} from 'chart.js';
import { useAuthStore } from '@/store/authStore';
import { AnalyticsData } from '@/types/analytics';
import { Loader2 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
        },
    },
};

const AnalyticsPage = () => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = useAuthStore((state) => state.token);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!token) {
                setLoading(false);
                setError("Authentication token not found.");
                return;
            }

            try {
                setLoading(true);
                const response = await fetch('/api/corp-admin/analytics', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch analytics data');
                }

                const data: AnalyticsData = await response.json();
                setAnalyticsData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [token]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    if (!analyticsData) {
        return <div className="text-center text-muted-foreground">No analytics data available.</div>;
    }

    const tenantGrowthChartData = {
        labels: analyticsData.tenant_growth.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [
            {
                label: 'New Tenants',
                data: analyticsData.tenant_growth.map(d => d.count),
                borderColor: 'hsl(var(--primary))',
                backgroundColor: 'hsla(var(--primary), 0.2)',
                fill: true,
            },
        ],
    };

    const bookingsChartData = {
        labels: analyticsData.bookings_over_time.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [
            {
                label: 'Bookings',
                data: analyticsData.bookings_over_time.map(d => d.count),
                borderColor: 'hsl(var(--destructive))',
                backgroundColor: 'hsla(var(--destructive), 0.2)',
            },
        ],
    };

    const tenantDistributionChartData = {
        labels: Object.keys(analyticsData.tenant_distribution),
        datasets: [
            {
                data: Object.values(analyticsData.tenant_distribution),
                backgroundColor: ['#36A2EB', '#FFCE56'],
                hoverOffset: 4,
            },
        ],
    };

    const utilizationChartData = {
        labels: ['Occupied', 'Available'],
        datasets: [
          {
            data: [analyticsData.workstation_utilization, 100 - analyticsData.workstation_utilization],
            backgroundColor: ['#4BC0C0', '#E0E0E0'],
            hoverOffset: 4
          }
        ]
      };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reporting</h1>
        <p className="text-muted-foreground">Insights into your company&apos;s engagement and growth.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tenant Growth</CardTitle>
            <CardDescription>New tenants joining over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line data={tenantGrowthChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Booking Activity</CardTitle>
            <CardDescription>Workstation bookings over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar data={bookingsChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tenant Distribution</CardTitle>
            <CardDescription>Breakdown of tenant types.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Pie data={tenantDistributionChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Workstation Utilization</CardTitle>
            <CardDescription>Percentage of occupied workstations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
                <div className="w-full h-full relative">
                    <Doughnut data={utilizationChartData} options={{...chartOptions, cutout: '60%'}} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{analyticsData.workstation_utilization.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
