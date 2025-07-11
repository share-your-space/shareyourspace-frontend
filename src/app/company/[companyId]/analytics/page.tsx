'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, Line, Pie } from 'react-chartjs-2';
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

const memberGrowthData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'New Members',
      data: [12, 19, 25, 30, 45, 50, 62],
      borderColor: 'hsl(var(--primary))',
      backgroundColor: 'hsla(var(--primary), 0.2)',
      fill: true,
    },
  ],
};

const connectionsOverTimeData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Connections Made',
      data: [65, 59, 80, 81, 102, 120, 145],
      borderColor: 'hsl(var(--destructive))',
      backgroundColor: 'hsla(var(--destructive), 0.2)',
    },
  ],
};

const skillDistributionData = {
    labels: ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Operations'],
    datasets: [
      {
        label: 'Skill Distribution',
        data: [40, 20, 15, 10, 10, 5],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        hoverOffset: 4
      }
    ]
  };

const AnalyticsPage = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reporting</h1>
        <p className="text-muted-foreground">Insights into your company&apos;s engagement and growth.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Member Growth</CardTitle>
            <CardDescription>New members joining over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line data={memberGrowthData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Connections Activity</CardTitle>
            <CardDescription>Connections being made within your space.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar data={connectionsOverTimeData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Skill Distribution</CardTitle>
            <CardDescription>Breakdown of primary skills across your members.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
            <div className="w-full max-w-[350px] h-[350px]">
                <Pie data={skillDistributionData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
