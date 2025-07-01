"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Building, BarChart3, MessageSquareText, CreditCard, BadgePercent, ShieldAlert, LayoutDashboard } from "lucide-react";
import React from "react";

// import { useAuth } from "@/contexts/AuthContext"; // Or your Zustand store
// import { useRouter } from "next/navigation";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard }, // Optional: A main admin dashboard page
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/spaces", label: "Space Management", icon: Building },
  { href: "/admin/stats", label: "Platform Statistics", icon: BarChart3 },
  { href: "/admin/feedback", label: "Feedback Inbox", icon: MessageSquareText },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/promo-codes", label: "Promo Codes", icon: BadgePercent },
  { href: "/admin/moderation", label: "Moderation Queue", icon: ShieldAlert },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // const { user, loading } = useAuth();
  // const router = useRouter();

  // useEffect(() => {
  //   if (!loading && (!user || user.role !== "SYS_ADMIN")) {
  //     router.push("/login"); // Or to an unauthorized page
  //   }
  // }, [user, loading, router]);

  // if (loading || !user || user.role !== "SYS_ADMIN") {
  //   return <div className=\"flex justify-center items-center h-screen\">Checking admin permissions...</div>; // Or a proper loader
  // }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4 border-r dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-6">SYS Admin Panel</h2>
        <nav>
          <ul>
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <li key={item.href} className="mb-2">
                  <Link href={item.href}
                    className={`flex items-center p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 ${isActive ? "bg-primary text-primary-foreground font-semibold" : ""}`}>
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-background">
        {children}
      </main>
    </div>
  );
} 