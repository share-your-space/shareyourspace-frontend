"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
// We'll need a way to fetch data, e.g., a custom hook or a library like SWR/React Query
// For now, let\'s assume a fetcher function: import { fetchWithAuth } from "@/lib/fetchWithAuth";
// And an auth hook: import { useAuth } from "@/contexts/AuthContext"; // Or your Zustand store

// Placeholder for API interactions - replace with actual calls
const fetchUsers = async (filters: any) => {
  // const queryParams = new URLSearchParams(filters).toString();
  // return fetchWithAuth(`/api/v1/admin/users?${queryParams}`);
  console.log("Fetching users with filters:", filters);
  // Mock data for now
  return [
    { id: "1", fullName: "Admin User", email: "admin@example.com", role: "SYS_ADMIN", status: "ACTIVE", spaceName: "N/A", createdAt: new Date().toISOString() },
    { id: "2", fullName: "Corporate Manager", email: "corp@example.com", role: "CORP_ADMIN", status: "ACTIVE", spaceName: "Pixida Hub", createdAt: new Date().toISOString() },
    { id: "3", fullName: "Startup Lead", email: "startup@example.com", role: "STARTUP_ADMIN", status: "WAITLISTED", spaceName: "Tech Incubator", createdAt: new Date().toISOString() },
    { id: "4", fullName: "Freelancer Joe", email: "joe@example.com", role: "FREELANCER", status: "PENDING_VERIFICATION", spaceName: "N/A", createdAt: new Date().toISOString() },
  ];
};

const updateUserStatus = async (userId: string, newStatus: string, newRole?: string) => {
  console.log(`Updating user ${userId} status to ${newStatus} and role to ${newRole}`);
  // return fetchWithAuth(`/api/v1/admin/users/${userId}/status`, { method: "PUT", body: JSON.stringify({ status: newStatus, role: newRole }) });
  return { success: true };
};

const assignUserToSpace = async (userId: string, spaceId: string | null) => {
  console.log(`Assigning user ${userId} to space ${spaceId}`);
  // return fetchWithAuth(`/api/v1/admin/users/${userId}/assign-space`, { method: "PUT", body: JSON.stringify({ space_id: spaceId }) });
  return { success: true };
};

const impersonateUser = async (userId: string) => {
  console.log(`Impersonating user ${userId}`);
  // const response = await fetchWithAuth(`/api/v1/admin/users/${userId}/impersonate`, { method: "POST" });
  // const data = await response.json();
  // if (response.ok && data.access_token) {
  //   // Handle storing the impersonation token and redirecting/refreshing
  //   alert(\`Impersonation token: ${data.access_token}\`);
  // }
  return { success: true };
};

interface User {
  id: string;
  fullName?: string;
  email: string;
  role: string;
  status: string;
  spaceName?: string; // Assuming space name is part of the user data or fetched separately
  createdAt: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [spaceFilter, setSpaceFilter] = useState<string | null>(null); // Assuming space ID or name
  // const { user } = useAuth(); // To ensure only SYS_ADMIN can access

  // useEffect(() => {
  //   if (user?.role !== 'SYS_ADMIN') {
  //     // redirect to / or /login
  //     return;
  //   }
  //   loadUsers();
  // }, [user]);

  useEffect(() => {
    loadUsers();
  }, [searchTerm, roleFilter, statusFilter, spaceFilter]);

  const loadUsers = async () => {
    const filters: any = {};
    if (searchTerm) filters.search = searchTerm;
    if (roleFilter) filters.role = roleFilter;
    if (statusFilter) filters.status = statusFilter;
    if (spaceFilter) filters.space = spaceFilter; // This might be space_id or space_name based on API

    const fetchedUsers = await fetchUsers(filters);
    setUsers(fetchedUsers);
  };

  const handleUpdateStatus = async (userId: string, newStatus: string, newRole?: string) => {
    await updateUserStatus(userId, newStatus, newRole);
    loadUsers(); // Refresh list
  };

  const handleAssignSpace = async (userId: string, spaceId: string | null) => {
    await assignUserToSpace(userId, spaceId);
    loadUsers(); // Refresh list
  };
  
  const handleImpersonate = async (userId: string) => {
    await impersonateUser(userId);
    // Further logic for token handling will be needed
  };

  // TODO: Replace with actual space data if available
  const availableSpaces = [
    { id: "space1", name: "Pixida Hub" },
    { id: "space2", name: "Tech Incubator" },
  ];

  const userRoles = ["SYS_ADMIN", "CORP_ADMIN", "CORP_EMPLOYEE", "STARTUP_ADMIN", "STARTUP_MEMBER", "FREELANCER"];
  const userStatuses = ["PENDING_VERIFICATION", "WAITLISTED", "PENDING_ONBOARDING", "ACTIVE", "SUSPENDED", "BANNED"];


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      
      <div className="flex gap-2 mb-4">
        <Input 
          placeholder="Search by name, email..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="max-w-xs"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{roleFilter || "Role"} <ChevronDown className="ml-2 h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setRoleFilter(null)}>All Roles</DropdownMenuItem>
            {userRoles.map(role => (
              <DropdownMenuItem key={role} onSelect={() => setRoleFilter(role)}>{role}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{statusFilter || "Status"} <ChevronDown className="ml-2 h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setStatusFilter(null)}>All Statuses</DropdownMenuItem>
            {userStatuses.map(status => (
              <DropdownMenuItem key={status} onSelect={() => setStatusFilter(status)}>{status}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
         {/* Simple text input for space filter, ideally a dropdown with actual spaces */}
        <Input 
          placeholder="Filter by Space ID/Name" 
          value={spaceFilter || ""} 
          onChange={(e) => setSpaceFilter(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Space</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.fullName || "N/A"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.status}</TableCell>
              <TableCell>{user.spaceName || "N/A"}</TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">Actions <ChevronDown className="ml-1 h-3 w-3"/></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => alert(\`View details for ${user.id}\`)}>View Details</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleImpersonate(user.id)} disabled={user.role === "SYS_ADMIN"}>Impersonate</DropdownMenuItem>
                    <DropdownMenu> {/* Nested for Change Status */}
                        <DropdownMenuTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()}>Change Status</DropdownMenuItem></DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {userStatuses.map(status => (
                                <DropdownMenuItem key={status} onSelect={() => handleUpdateStatus(user.id, status, user.role)}>{status}</DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu> {/* Nested for Change Role - Use with extreme caution! */}
                        <DropdownMenuTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()}>Change Role</DropdownMenuItem></DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {userRoles.map(role => (
                                <DropdownMenuItem key={role} onSelect={() => handleUpdateStatus(user.id, user.status, role)}>{role}</DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu> {/* Nested for Assign Space */}
                        <DropdownMenuTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()}>Assign Space</DropdownMenuItem></DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => handleAssignSpace(user.id, null)}>Unassign</DropdownMenuItem>
                            {availableSpaces.map(space => (
                                <DropdownMenuItem key={space.id} onSelect={() => handleAssignSpace(user.id, space.id)}>{space.name}</DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {users.length === 0 && <p className="text-center py-4">No users found.</p>}
    </div>
  );
} 