'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import {
  getMyManagedSpace,
  listMySpaceTenants,
  listMySpaceWorkstations,
  assignWorkstation,
  unassignWorkstation,
  listAllUsersInMySpace,
  getSpaceConnectionStats,
  createWorkstation,
  updateWorkstation,
  deleteWorkstation,
} from '@/lib/api/spaces';
import {
  ManagedSpaceDetail,
  BasicUser,
  TenantInfo,
  StartupTenantInfo,
  FreelancerTenantInfo,
  WorkstationDetail,
  WorkstationStatus as WorkstationStatusType,
  SpaceConnectionStatsResponse,
  WorkstationCreate,
  WorkstationUpdate,
  Interest,
} from '@/types/space';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit3, Trash2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import AuthGuard from '@/components/layout/AuthGuard';
import InviteEmployeeCard from '@/components/dashboard/corporate-admin/InviteEmployeeCard';
import AssignWorkstationModal from '@/components/dashboard/corporate-admin/AssignWorkstationModal';
import InterestCard from '@/components/dashboard/corporate-admin/InterestCard';
import ManageStartupSlotsDialog from '@/components/dashboard/corporate-admin/ManageStartupSlotsDialog';

function isStartupTenant(tenant: TenantInfo): tenant is StartupTenantInfo {
  return tenant.type === "startup";
}

const AVAILABLE_STATUSES: WorkstationStatusType[] = [WorkstationStatusType.AVAILABLE, WorkstationStatusType.MAINTENANCE];

export default function CorporateAdminDashboardPage() {
  const { user, isAuthenticated, setUser, isLoading: isAuthLoading } = useAuthStore();
  const searchParams = useSearchParams();
  
  const [spaceDetails, setSpaceDetails] = useState<ManagedSpaceDetail | null>(null);
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [workstations, setWorkstations] = useState<WorkstationDetail[]>([]);
  const [allSpaceUsers, setAllSpaceUsers] = useState<BasicUser[]>([]);
  const [spaceConnectionStats, setSpaceConnectionStats] = useState<SpaceConnectionStatsResponse | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [hasNoSpace, setHasNoSpace] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [userIdToAssign, setUserIdToAssign] = useState<string | undefined>();
  const [isAssigning, setIsAssigning] = useState(false);
  
  const [selectedWorkstationForUnassignment, setSelectedWorkstationForUnassignment] = useState<WorkstationDetail | null>(null);
  const [isUnassignModalOpen, setIsUnassignModalOpen] = useState(false);

  const [isAddWorkstationModalOpen, setIsAddWorkstationModalOpen] = useState(false);
  const [addWorkstationData, setAddWorkstationData] = useState<WorkstationCreate>({ name: '', status: WorkstationStatusType.AVAILABLE });
  
  const [isEditWorkstationModalOpen, setIsEditWorkstationModalOpen] = useState(false);
  const [selectedWorkstationForEdit, setSelectedWorkstationForEdit] = useState<WorkstationDetail | null>(null);
  const [editWorkstationData, setEditWorkstationData] = useState<WorkstationUpdate>({ name: undefined, status: undefined });
  
  const [isDeleteWorkstationDialogOpen, setIsDeleteWorkstationDialogOpen] = useState(false);
  const [workstationToDelete, setWorkstationToDelete] = useState<WorkstationDetail | null>(null);
  
  const [userToRemove, setUserToRemove] = useState<BasicUser | null>(null);

  const [workstationSearch, setWorkstationSearch] = useState("");
  const [workstationStatusFilter, setWorkstationStatusFilter] = useState<WorkstationStatusType | "ALL">("ALL");

  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");

  const fetchData = useCallback(async () => {
    if (!user || user.role !== 'CORP_ADMIN' || user.status !== 'ACTIVE') {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const spaceData = await getMyManagedSpace();
      setHasNoSpace(false);
      setSpaceDetails(spaceData);

      const [tenantData, workstationData, allUsersData, connectionsData, interestsData] = await Promise.all([
        listMySpaceTenants(),
        listMySpaceWorkstations(),
        listAllUsersInMySpace(),
        getSpaceConnectionStats(),
        api.get('/spaces/me/interests'),
      ]);
      setTenants(tenantData.tenants);
      setWorkstations(workstationData.workstations);
      setAllSpaceUsers(allUsersData.users);
      setSpaceConnectionStats(connectionsData);
      setInterests(interestsData.data.interests);

    } catch (err: unknown) {
      const error = err as { response?: { status?: number }; message?: string };
      if (error.response?.status === 404) {
        setHasNoSpace(true);
      } else {
        toast.error("Dashboard Error", {
          description: error.message || 'An unknown error occurred while fetching dashboard data.',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, isAuthLoading, fetchData]);

  useEffect(() => {
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    if (action === 'assignWorkstation' && userId) {
        setUserIdToAssign(userId);
        setIsAssignModalOpen(true);
    }
  }, [searchParams]);

  const handleCreateFirstSpace = async () => {
    if (!newSpaceName.trim() || !user?.company_id) {
      toast.error("Please provide a name for your space.");
      return;
    }
    setIsCreatingSpace(true);
    try {
      const response = await api.post('/spaces', {
        name: newSpaceName,
        company_id: user.company_id,
        corporate_admin_id: user.id,
        total_workstations: 0,
      });

      const { user: updatedUser, space: newSpace } = response.data;
      
      if (updatedUser) {
        setUser(updatedUser);
      }

      toast.success(`Your space "${newSpace.name}" has been created! Welcome.`);
      
      setHasNoSpace(false);
    } catch (err: unknown) {
        const error = err as { response?: { data?: { detail?: string | [{ msg: string, loc: (string|number)[] }] }}};
        const detail = error.response?.data?.detail;
        if (Array.isArray(detail)) {
            const errorDetails = detail[0];
            const errorMessage = `${errorDetails.msg} (in ${errorDetails.loc[1]})`;
            toast.error("Failed to create space", { description: errorMessage });
        } else {
            const detailMessage = typeof detail === 'string' ? detail : "An unexpected error occurred.";
            toast.error("Failed to create space", { description: detailMessage });
        }
    } finally {
      setIsCreatingSpace(false);
    }
  };

  const assignableUsers = useMemo(() => {
    const occupiedUserIds = new Set(
      workstations.filter(ws => ws.occupant).map(ws => ws.occupant?.user_id)
    );
    return allSpaceUsers.filter(u => !occupiedUserIds.has(u.id));
  }, [allSpaceUsers, workstations]);

  const availableWorkstations = useMemo(() => {
    return workstations.filter(ws => ws.status === WorkstationStatusType.AVAILABLE);
  }, [workstations]);

  const handleOpenAssignModal = (workstationId?: number, userId?: string) => {
    setUserIdToAssign(userId);
    setIsAssignModalOpen(true);
  };

  const handleAssignUser = async (userId: string, workstationId: number) => {
    setIsAssigning(true);
    try {
      await assignWorkstation(workstationId, Number(userId));
      toast.success("Workstation assigned successfully.");
      setIsAssignModalOpen(false);
      fetchData(); 
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } }, message?: string };
      const errorMessage = error.response?.data?.detail || error.message || "Failed to assign workstation.";
      toast.error("Assignment Failed", { description: errorMessage });
    } finally {
        setIsAssigning(false);
    }
  };

  const handleOpenUnassignModal = (workstation: WorkstationDetail) => {
    setSelectedWorkstationForUnassignment(workstation);
    setIsUnassignModalOpen(true);
  };

  const handleUnassignUser = async () => {
    if (!selectedWorkstationForUnassignment) return;
    try {
      await unassignWorkstation(selectedWorkstationForUnassignment.id);
      toast.success(`User unassigned from ${selectedWorkstationForUnassignment.name} successfully.`);
      setIsUnassignModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } }, message?: string };
      const errorMessage = error.response?.data?.detail || error.message || "Failed to unassign user from workstation.";
      toast.error("Unassignment Failed", { description: errorMessage });
    }
  };

  const handleRemoveUser = async () => {
    if (!userToRemove) return;
    try {
      await api.delete(`/spaces/me/users/${userToRemove.id}`);
      toast.success(`Successfully removed ${userToRemove.full_name || userToRemove.email} from the space.`);
      setUserToRemove(null);
      fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } }, message?: string };
      const errorMessage = error.response?.data?.detail || error.message || "Failed to remove user.";
      toast.error("Removal Failed", { description: errorMessage });
    }
  };
  
  const handleOpenAddWorkstationModal = () => {
    setAddWorkstationData({ name: '', status: WorkstationStatusType.AVAILABLE });
    setIsAddWorkstationModalOpen(true);
  };
  
  const handleCreateWorkstation = async () => {
    if (!addWorkstationData.name.trim()) {
      toast.error("Please provide a name for the workstation.");
      return;
    }
    try {
      await createWorkstation(addWorkstationData);
      toast.success("Workstation created successfully.");
      setIsAddWorkstationModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } }};
      toast.error("Failed to create workstation", {
        description: error.response?.data?.detail || "An unexpected error occurred."
      });
    }
  };
  
  const handleOpenEditWorkstationModal = (workstation: WorkstationDetail) => {
    setSelectedWorkstationForEdit(workstation);
    setEditWorkstationData({ name: workstation.name, status: workstation.status });
    setIsEditWorkstationModalOpen(true);
  };
  
  const handleUpdateWorkstation = async () => {
    if (!selectedWorkstationForEdit) return;
    try {
      await updateWorkstation(selectedWorkstationForEdit.id, editWorkstationData);
      toast.success("Workstation updated successfully.");
      setIsEditWorkstationModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } }};
      toast.error("Failed to update workstation", {
        description: error.response?.data?.detail || "An unexpected error occurred."
      });
    }
  };
  
  const handleOpenDeleteWorkstationDialog = (workstation: WorkstationDetail) => {
    setWorkstationToDelete(workstation);
    setIsDeleteWorkstationDialogOpen(true);
  };
  
  const handleDeleteWorkstation = async () => {
    if (!workstationToDelete) return;
    try {
      await deleteWorkstation(workstationToDelete.id);
      toast.success("Workstation deleted successfully.");
      setIsDeleteWorkstationDialogOpen(false);
      fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } }};
      toast.error("Failed to delete workstation", {
        description: error.response?.data?.detail || "An unexpected error occurred."
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'default';
      case 'OCCUPIED': return 'destructive';
      case 'MAINTENANCE': return 'secondary';
      default: return 'outline';
    }
  };

  const getTruncatedUserDisplay = (user: {full_name?: string | null, email: string | null} | null, maxLength = 25): string => {
    if (!user || !user.email) return '-';
    const primaryDisplay = user.full_name || user.email;
    if (primaryDisplay.length <= maxLength) return primaryDisplay;
    return `${primaryDisplay.substring(0, maxLength)}...`;
  };

  const startups = tenants.filter(isStartupTenant);
  const freelancers = tenants.filter((t): t is FreelancerTenantInfo => !isStartupTenant(t));

  const filteredWorkstations = useMemo(() => {
    return workstations
      .filter(ws => {
        if (workstationStatusFilter !== "ALL" && ws.status !== workstationStatusFilter) {
          return false;
        }
        if (workstationSearch) {
          const searchTerm = workstationSearch.toLowerCase();
          const nameMatch = ws.name.toLowerCase().includes(searchTerm);
          const occupantMatch = ws.occupant && 
            (ws.occupant.full_name?.toLowerCase().includes(searchTerm) || 
             (ws.occupant.email && ws.occupant.email.toLowerCase().includes(searchTerm)));
          return nameMatch || !!occupantMatch;
        }
        return true;
      });
  }, [workstations, workstationSearch, workstationStatusFilter]);

  const filteredUsers = useMemo(() => {
    return allSpaceUsers
      .filter(u => {
        if (userRoleFilter !== "ALL" && u.role !== userRoleFilter) {
          return false;
        }
        if (userSearch) {
          const searchTerm = userSearch.toLowerCase();
          const nameMatch = u.full_name && u.full_name.toLowerCase().includes(searchTerm);
          const emailMatch = u.email && u.email.toLowerCase().includes(searchTerm);
          return !!(nameMatch || emailMatch);
        }
        return true;
      });
  }, [allSpaceUsers, userSearch, userRoleFilter]);

  const uniqueUserRoles = useMemo(() => {
    const roles = new Set(allSpaceUsers.map(u => u.role).filter(Boolean));
    return ["ALL", ...Array.from(roles)] as string[];
  }, [allSpaceUsers]);

  if (user?.status === 'PENDING_VERIFICATION' && user?.role === 'CORP_ADMIN') {
     return (
        <AuthGuard>
            <AuthenticatedLayout>
                 <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                    <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Welcome! Let&apos;s Create Your First Space</CardTitle>
                        <CardDescription>
                        A &apos;Space&apos; represents your physical office or location where startups and freelancers will work.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                        <Label htmlFor="space-name">Space Name</Label>
                        <Input
                            id="space-name"
                            placeholder="e.g., 'Headquarters - Innovation Floor'"
                            value={newSpaceName}
                            onChange={(e) => setNewSpaceName(e.target.value)}
                        />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleCreateFirstSpace} disabled={isCreatingSpace} className="w-full">
                        {isCreatingSpace ? "Creating..." : "Create Space"}
                        </Button>
                    </CardFooter>
                    </Card>
                </div>
            </AuthenticatedLayout>
        </AuthGuard>
     )
  }

  if (isAuthLoading || loading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading Corporate Dashboard...</p></div>;
  }
  
  return (
    <AuthGuard>
      <AuthenticatedLayout>
        {hasNoSpace ? (
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>Welcome! Let&apos;s Create Your First Space</CardTitle>
                <CardDescription>
                  A &apos;Space&apos; represents your physical office or location where startups and freelancers will work.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="space-name">Space Name</Label>
                  <Input
                    id="space-name"
                    placeholder="e.g., 'Headquarters - Innovation Floor'"
                    value={newSpaceName}
                    onChange={(e) => setNewSpaceName(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleCreateFirstSpace} disabled={isCreatingSpace} className="w-full">
                  {isCreatingSpace ? "Creating..." : "Create Space"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="p-4 md:p-8">
            <header className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">{spaceDetails?.name || 'Corporate Dashboard'}</h1>
                        <p className="text-muted-foreground">{spaceDetails?.address || 'Manage your space, tenants, and workstations.'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ManageStartupSlotsDialog startups={startups} onSlotsUpdated={fetchData} />
                        {user?.company_id && (
                            <Link href={`/companies/${user.company_id}`} passHref>
                                <Button variant="outline">View Company Profile</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>
            
            <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="tenants">Tenants</TabsTrigger>
                    <TabsTrigger value="workstations">Workstations</TabsTrigger>
                    <TabsTrigger value="users">All Users</TabsTrigger>
                    <TabsTrigger value="interests">Interests</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{spaceConnectionStats?.total_tenants ?? '0'}</div>
                        <p className="text-xs text-muted-foreground">Startups and Freelancers</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Workstations</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{spaceConnectionStats?.occupied_workstations ?? '0'} / {spaceConnectionStats?.total_workstations ?? '0'}</div>
                        <p className="text-xs text-muted-foreground">Occupied vs. Total</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Connections</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M17.2 11.2 22 6.4" /><path d="m22 16.1-4.8-4.8" /><path d="M17.2 11.2 22 6.4" /><path d="m22 16.1-4.8-4.8" /><path d="M2 12h5" /><path d="M7 12h2.5" /><path d="M14.5 12H12" /><path d="m7.8 7.8 1.4-1.4" /><path d="m14.8 14.8 1.4-1.4" /><path d="m7.8 16.2 1.4 1.4" /><path d="m14.8 9.2-1.4 1.4" /><circle cx="12" cy="12" r="10" /></svg>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">+{spaceConnectionStats?.connections_this_month ?? '0'}</div>
                        <p className="text-xs text-muted-foreground">in the last 30 days</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{allSpaceUsers.length}</div>
                        <p className="text-xs text-muted-foreground">Users currently in your space.</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="tenants">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tenants</CardTitle>
                      <CardDescription>
                        A list of all freelancers and startups in your space.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="startups">
                            <TabsList>
                                <TabsTrigger value="startups">Startups</TabsTrigger>
                                <TabsTrigger value="freelancers">Freelancers</TabsTrigger>
                            </TabsList>
                            <TabsContent value="startups">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Members</TableHead>
                                            <TableHead>Allocated Slots</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {startups.map(s => (
                                            <TableRow key={s.details.id}>
                                                <TableCell>
                                                    <Link href={`/dashboard/corporate-admin/startups/${s.details.id}`} className="hover:underline">
                                                        {s.details.name}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{s.details.member_slots_used} / {s.member_count}</TableCell>
                                                <TableCell>{s.details.member_slots_allocated}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                            <TabsContent value="freelancers">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {freelancers.map(f => (
                                            <TableRow key={f.details.id}>
                                                <TableCell>{f.details.full_name}</TableCell>
                                                <TableCell>{f.details.email}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="workstations">
                  <Card>
                    <CardHeader>
                        <CardTitle>Workstations ({filteredWorkstations.length})</CardTitle>
                        <CardDescription>An overview of all workstations in your space.</CardDescription>
                         <div className="mt-4 flex space-x-4">
                            <Input
                                placeholder="Search by name or occupant..."
                                value={workstationSearch}
                                onChange={(e) => setWorkstationSearch(e.target.value)}
                                className="max-w-sm"
                            />
                            <Select value={workstationStatusFilter} onValueChange={(value: WorkstationStatusType | "ALL") => setWorkstationStatusFilter(value)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value={WorkstationStatusType.AVAILABLE}>Available</SelectItem>
                                    <SelectItem value={WorkstationStatusType.OCCUPIED}>Occupied</SelectItem>
                                    <SelectItem value={WorkstationStatusType.MAINTENANCE}>Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Occupant</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredWorkstations.map((ws) => (
                            <TableRow key={ws.id}>
                                <TableCell className="font-medium">{ws.name}</TableCell>
                                <TableCell>
                                <Badge variant={getStatusBadgeVariant(ws.status)}>{ws.status}</Badge>
                                </TableCell>
                                <TableCell>{getTruncatedUserDisplay(ws.occupant)}</TableCell>
                                <TableCell className="text-right space-x-2">
                                {ws.occupant ? (
                                    <Button variant="outline" size="sm" onClick={() => handleOpenUnassignModal(ws)}>Unassign</Button>
                                ) : (
                                    <Button variant="outline" size="sm" onClick={() => handleOpenAssignModal(ws.id)} disabled={ws.status !== 'AVAILABLE'}>Assign</Button>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => handleOpenEditWorkstationModal(ws)}><Edit3 className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteWorkstationDialog(ws)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleOpenAddWorkstationModal}>Add Workstation</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                <TabsContent value="users">
                  <Card>
                    <CardHeader>
                        <CardTitle>All Users in Space</CardTitle>
                        <div className="mt-2 flex flex-col sm:flex-row gap-4">
                            <Input
                                placeholder="Search by name or email..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="max-w-xs"
                            />
                            <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Filter by role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {uniqueUserRoles.map(role => (
                                        <SelectItem key={role} value={role}>{role === "ALL" ? "All Roles" : role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <InviteEmployeeCard onEmployeeInvited={fetchData} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((usr) => (
                            <TableRow key={usr.id}>
                                <TableCell><Link href={`/dashboard/users/${usr.id}`} className="hover:underline text-blue-600 dark:text-blue-400">{usr.full_name || 'N/A'}</Link></TableCell>
                                <TableCell>{usr.email}</TableCell>
                                <TableCell><Badge variant="outline">{usr.role}</Badge></TableCell>
                                <TableCell className="text-right">
                                <Button variant="destructive" size="sm" onClick={() => setUserToRemove(usr)}>Remove from Space</Button>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="interests">
                  <Card>
                    <CardHeader>
                      <CardTitle>Expressions of Interest</CardTitle>
                      <CardDescription>
                        Users who have expressed interest in joining your space.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {interests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {interests.map((interest) => (
                            <InterestCard
                              key={interest.id}
                              interest={interest}
                              onInterestAccepted={fetchData}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          No expressions of interest yet.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
            </Tabs>
          </div>
        )}

        {/* --- DIALOGS AND MODALS --- */}

        {/* Assign Workstation Modal */}
        <AssignWorkstationModal
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            assignableUsers={assignableUsers}
            availableWorkstations={availableWorkstations}
            onAssign={handleAssignUser}
            userIdToAssign={userIdToAssign}
            isAssigning={isAssigning}
        />

        {/* Unassign Workstation Confirmation */}
        <AlertDialog open={isUnassignModalOpen} onOpenChange={setIsUnassignModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will unassign {selectedWorkstationForUnassignment?.occupant?.full_name || 'the user'} from {selectedWorkstationForUnassignment?.name}. They will lose access to this specific workstation.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleUnassignUser}>Unassign</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Add Workstation Modal */}
        <Dialog open={isAddWorkstationModalOpen} onOpenChange={setIsAddWorkstationModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Workstation</DialogTitle>
                    <DialogDescription>
                        Create a new workstation for your space. You can assign a user to it later.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="workstation-name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="workstation-name"
                            value={addWorkstationData.name}
                            onChange={(e) => setAddWorkstationData({ ...addWorkstationData, name: e.target.value })}
                            className="col-span-3"
                            placeholder="e.g., Desk 14B"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="workstation-status" className="text-right">
                            Status
                        </Label>
                        <Select
                            value={addWorkstationData.status}
                            onValueChange={(value: WorkstationStatusType) => setAddWorkstationData({ ...addWorkstationData, status: value })}
                        >
                            <SelectTrigger id="workstation-status" className="col-span-3">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {AVAILABLE_STATUSES.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddWorkstationModalOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={handleCreateWorkstation}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Edit Workstation Modal */}
        <Dialog open={isEditWorkstationModalOpen} onOpenChange={setIsEditWorkstationModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Workstation: {selectedWorkstationForEdit?.name}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-workstation-name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="edit-workstation-name"
                            value={editWorkstationData.name || ''}
                            onChange={(e) => setEditWorkstationData({ ...editWorkstationData, name: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-workstation-status" className="text-right">
                            Status
                        </Label>
                        <Select
                            value={editWorkstationData.status}
                            onValueChange={(value: WorkstationStatusType) => setEditWorkstationData({ ...editWorkstationData, status: value })}
                        >
                            <SelectTrigger id="edit-workstation-status" className="col-span-3">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(WorkstationStatusType).map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEditWorkstationModalOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={handleUpdateWorkstation}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Delete Workstation Confirmation */}
        <AlertDialog open={isDeleteWorkstationDialogOpen} onOpenChange={setIsDeleteWorkstationDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the workstation
                        &quot;{workstationToDelete?.name}&quot;.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteWorkstation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Remove User from Space Confirmation */}
        <AlertDialog open={!!userToRemove} onOpenChange={(open) => !open && setUserToRemove(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Remove {userToRemove?.full_name || userToRemove?.email}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to remove this user from the space? They will lose access to all workstations and space-related features.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setUserToRemove(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemoveUser}>Remove User</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      </AuthenticatedLayout>
    </AuthGuard>
  );
}