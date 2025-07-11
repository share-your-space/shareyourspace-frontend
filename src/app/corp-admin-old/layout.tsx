"use client";

import AuthGuard from "@/components/layout/AuthGuard";
import { UserRole } from "@/types/enums";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SpaceProvider, useSpace } from "@/context/SpaceContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CreateSpaceDialog } from "@/components/corp-admin/CreateSpaceDialog";
import { Space, BasicSpace } from "@/types/space";
import { toast } from "sonner";
import { DialogProvider, useDialog } from "@/context/DialogContext";

const CorpAdminDashboard = ({ children }: { children: React.ReactNode }) => {
  const { 
    spaces, 
    selectedSpace, 
    setSelectedSpaceId, 
    loading, 
    showOnboarding, 
    refetchSpaces 
  } = useSpace();
  const { isSpaceCreateDialogOpen, setSpaceCreateDialogOpen } = useDialog();
  const pathname = usePathname();

  useEffect(() => {
    refetchSpaces();
  }, [refetchSpaces]);

  useEffect(() => {
    if (showOnboarding) {
      setSpaceCreateDialogOpen(true);
    }
  }, [showOnboarding, setSpaceCreateDialogOpen]);

  const handleSpaceCreated = (newSpace: BasicSpace) => {
    refetchSpaces().then(() => {
      setSelectedSpaceId(newSpace.id.toString());
      toast.success(`Space "${newSpace.name}" created and selected.`);
      setSpaceCreateDialogOpen(false);
    });
  };

  const navLinks = [
    { href: "/corp-admin", label: "Dashboard" },
    { href: "/corp-admin/space-profile", label: "Space Profile" },
    { href: "/corp-admin/tenants", label: "Tenants" },
    { href: "/corp-admin/workstations", label: "Workstations" },
    { href: "/corp-admin/users", label: "All Users" },
    { href: "/corp-admin/browse-waitlist", label: "Browse Tenants" },
    { href: "/corp-admin/invite-admin", label: "Invite Admin" },
  ];

  if (loading) {
    return <div className="p-4">Loading dashboard...</div>;
  }

  // The onboarding view is now simpler, as the dialog opens automatically.
  if (showOnboarding) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Welcome to ShareYourSpace!</h1>
        <p className="text-muted-foreground mb-4">Let's create your first space to get started.</p>
        <CreateSpaceDialog
          isOpen={isSpaceCreateDialogOpen}
          onOpenChange={setSpaceCreateDialogOpen}
          onSpaceCreated={handleSpaceCreated}
          title="Create Your First Space"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Corporate Administration</h1>
        <div className="flex items-center gap-4">
          {spaces.length > 0 && selectedSpace ? (
            <select
              value={selectedSpace.id.toString()}
              onChange={(e) => setSelectedSpaceId(e.target.value)}
              className="p-2 border rounded-md bg-background"
            >
              {spaces.map((space) => (
                <option key={space.id} value={space.id.toString()}>
                  {space.name}
                </option>
              ))}
            </select>
          ) : (
            !loading && <p>No spaces found for your company.</p>
          )}
          <Button onClick={() => setSpaceCreateDialogOpen(true)}>Create New Space</Button>
        </div>
      </div>

      <CreateSpaceDialog
        isOpen={isSpaceCreateDialogOpen && !showOnboarding}
        onOpenChange={setSpaceCreateDialogOpen}
        onSpaceCreated={handleSpaceCreated}
        title="Create a New Space"
      />

      {selectedSpace && (
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
      )}

      <div className="mt-4 p-4 border rounded-lg bg-card">
        {selectedSpace ? children : <p>Please select a space to continue.</p>}
      </div>
    </div>
  );
};

export default function CorpAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={[UserRole.CORP_ADMIN]}>
      <SpaceProvider>
        <DialogProvider>
          <CorpAdminDashboard>{children}</CorpAdminDashboard>
        </DialogProvider>
      </SpaceProvider>
    </AuthGuard>
  );
}
