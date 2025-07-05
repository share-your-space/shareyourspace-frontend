"use client";

import AuthGuard from "@/components/layout/AuthGuard";
import { UserRole } from "@/types/enums";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SysAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const navLinks = [
    { href: "/sys-admin", label: "Dashboard" },
    { href: "/sys-admin/spaces", label: "Manage Spaces" },
    { href: "/sys-admin/users", label: "Manage Users" },
  ];

  return (
    <AuthGuard allowedRoles={[UserRole.SYS_ADMIN]}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">System Administration</h1>
        <nav className="mb-4 border-b">
          <ul className="flex space-x-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "pb-2 border-b-2 transition-colors",
                    pathname === link.href
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-primary"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* We can add SysAdmin-specific navigation here later */}
        {children}
      </div>
    </AuthGuard>
  );
}
