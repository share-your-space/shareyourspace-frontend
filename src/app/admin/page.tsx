"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Users, Building, BarChart3, MessageSquareText, CreditCard, BadgePercent, ShieldAlert } from "lucide-react";

const quickAccessItems = [
  { href: "/admin/users", label: "User Management", icon: Users, description: "Manage all platform users." },
  { href: "/admin/spaces", label: "Space Management", icon: Building, description: "Create, edit, and manage spaces." },
  { href: "/admin/stats", label: "Platform Statistics", icon: BarChart3, description: "View key platform metrics." },
  { href: "/admin/feedback", label: "Feedback Inbox", icon: MessageSquareText, description: "Review user feedback." },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard, description: "Manage subscription plans." },
  { href: "/admin/promo-codes", label: "Promo Codes", icon: BadgePercent, description: "Create and manage promo codes." },
  { href: "/admin/moderation", label: "Moderation Queue", icon: ShieldAlert, description: "Handle reported content/users." },
];

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">Welcome to the System Administration Panel. From here you can manage users, spaces, view statistics, and access other administrative tools.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quickAccessItems.map((item) => (
          <Link href={item.href} key={item.href} passHref>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">{item.label}</CardTitle>
                <item.icon className="h-6 w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {/* You can add more sections here, like recent activity, critical alerts, etc. */}
      {/* <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">No recent activity to display yet.</p>
            {/* Placeholder for activity log */}
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
} 