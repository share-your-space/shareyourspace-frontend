"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Assume fetchWithAuth is available: import { fetchWithAuth } from "@/lib/fetchWithAuth";

// Placeholder for API interaction - replace with actual call
const fetchStats = async () => {
  console.log("Fetching platform stats");
  // return fetchWithAuth("/api/v1/admin/stats"); 
  // Mock data for now
  return {
    totalUsers: 1500,
    activeUsers: 1200,
    usersPerSpaceAvg: 25,
    totalSpaces: 48,
    connectionsMade: 5000,
    waitlistSize: 50,
    conversionRateWaitlistToActive: 0.65, // 65%
    // Revenue metrics would require Stripe data and are more complex
    // agentUsage: ..., // Requires logging for agent features
    // referralRates: ..., // Requires referral data
  };
};

interface PlatformStats {
  totalUsers?: number;
  activeUsers?: number;
  usersPerSpaceAvg?: number;
  totalSpaces?: number;
  connectionsMade?: number;
  waitlistSize?: number;
  conversionRateWaitlistToActive?: number;
  [key: string]: any; // Allow other stats
}

const StatCard: React.FC<{ title: string; value: string | number | undefined; description?: string }> = ({ title, value, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {/* Optional: Icon can go here */}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value === undefined ? 'N/A' : value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

export default function StatisticsPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const fetchedStats = await fetchStats();
        setStats(fetchedStats);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        // Optionally set an error state here
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading statistics...</div>;
  }

  if (!stats) {
    return <div className="container mx-auto p-4 text-center">Failed to load statistics.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Platform Statistics</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Active Users" value={stats.activeUsers} />
        <StatCard title="Total Spaces" value={stats.totalSpaces} />
        <StatCard title="Avg. Users per Space" value={stats.usersPerSpaceAvg?.toFixed(1)} /> 
        <StatCard title="Connections Made" value={stats.connectionsMade} />
        <StatCard title="Waitlist Size" value={stats.waitlistSize} />
        <StatCard 
          title="Waitlist Conversion Rate"
          value={stats.conversionRateWaitlistToActive !== undefined ? `${(stats.conversionRateWaitlistToActive * 100).toFixed(1)}%` : 'N/A'}
          description="Waitlisted to Active"
        />
        {/* Add more StatCard components as new stats become available from the API */}
        {/* Example for future stats:
        <StatCard title="Monthly Recurring Revenue" value={stats.mrr ? `$${stats.mrr}` : 'N/A'} />
        <StatCard title="Agent Searches This Month" value={stats.agentSearches} />
        <StatCard title="Successful Referrals" value={stats.successfulReferrals} /> 
        */}
      </div>
    </div>
  );
} 