"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore'; // Assuming auth store for role checking
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  getMyManagedSpace,
  listMySpaceEmployees,
  listMySpaceTenants,
  listMySpaceWorkstations, // Added for workstation management
  assignWorkstation, // Added for assigning users
  unassignWorkstation, // Added for unassigning users
  updateWorkstationStatus, // Added for changing status
  listAllUsersInMySpace, // Added
  getSpaceConnectionStats, // Added for connection stats
  createWorkstation, // Added
  updateWorkstation, // Added
  deleteWorkstation, // Added
} from '@/lib/api/spaces'; // Assuming these might be here or in a dedicated member requests api file

// Using the already defined imports for member requests from the original file
import {
  listPendingMemberRequests,
  approveMemberRequest,
  rejectMemberRequest, // Changed from denyMemberRequest to match backend
} from '@/lib/api/memberRequests';
import type {
  Notification as MemberRequestNotification // Assuming the backend returns a list of Notification objects
} from '@/types/notification'; // Re-using existing Notification type if suitable, or a specific MemberRequest type

import {
  ManagedSpaceDetail,
  EmployeeListResponse,
  SpaceTenantResponse,
  BasicUser,
  StartupTenantInfo,
  FreelancerTenantInfo,
  TenantInfo,
  WorkstationDetail, // Added
  SpaceWorkstationListResponse, // Added
  WorkstationStatus as WorkstationStatusType, // Import the enum/type for status
  SpaceUsersListResponse, // Added
  SpaceConnectionStatsResponse, // Added for connection stats
  WorkstationCreate, // Added
  WorkstationUpdate, // Added
} from '@/types/space';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Building, Users, Briefcase, HardHat, UserCheck, Users2, Edit3, UserPlus, XCircle, Settings2, TrendingUp, Globe, MailQuestion, CheckCircle2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge"; // For status display
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogOverlay,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { toast } from "sonner"; // Assuming you have a toast component
import { User, SpaceUser } from "@/types/auth"; // Check if SpaceUser is in auth or space types
import { BasicStartup } from '@/types/space'; // Import BasicStartup
import { getStartupsInMySpace } from "@/lib/api/spaces"; // Import getStartupsInMySpace
import AssignWorkstationModal from "@/components/dashboard/corporate-admin/AssignWorkstationModal";
import ChangeWorkstationStatusModal from "@/components/dashboard/corporate-admin/ChangeWorkstationStatusModal";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import AddUserToSpaceCard from "@/components/dashboard/corporate-admin/AddUserToSpaceCard";

// Helper to check if tenant is StartupTenantInfo
function isStartupTenant(tenant: TenantInfo): tenant is StartupTenantInfo {
  return tenant.type === "startup" && tenant.hasOwnProperty('member_count');
}

const AVAILABLE_STATUSES: WorkstationStatusType[] = ['AVAILABLE', 'MAINTENANCE'];

export default function CorporateAdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [spaceDetails, setSpaceDetails] = useState<ManagedSpaceDetail | null>(null);
  const [employees, setEmployees] = useState<BasicUser[]>([]);
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [workstations, setWorkstations] = useState<WorkstationDetail[]>([]); // State for workstations
  const [allSpaceUsers, setAllSpaceUsers] = useState<SpaceUsersListResponse | null>(null);
  const [spaceConnectionStats, setSpaceConnectionStats] = useState<SpaceConnectionStatsResponse | null>(null); // State for connection stats
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for Assign User Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedWorkstationIdForAssignment, setSelectedWorkstationIdForAssignment] = useState<string | null>(null);
  const [selectedUserIdForAssignment, setSelectedUserIdForAssignment] = useState<string | undefined>(undefined);
  const [selectedUserObjectForAssignment, setSelectedUserObjectForAssignment] = useState<BasicUser | null>(null); // New state for selected user object
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  // State for Unassign User Modal
  const [isUnassignModalOpen, setIsUnassignModalOpen] = useState(false);
  const [selectedWorkstationForUnassignment, setSelectedWorkstationForUnassignment] = useState<WorkstationDetail | null>(null);
  const [unassignmentError, setUnassignmentError] = useState<string | null>(null);

  // Change Status Modal State
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [selectedWorkstationForStatusChange, setSelectedWorkstationForStatusChange] = useState<WorkstationDetail | null>(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState<WorkstationStatusType | undefined>(undefined);
  const [statusChangeError, setStatusChangeError] = useState<string | null>(null);

  // State for Member Requests
  const [memberRequests, setMemberRequests] = useState<MemberRequestNotification[]>([]); // Use Notification type
  const [isLoadingMemberRequests, setIsLoadingMemberRequests] = useState(false);
  const [memberRequestError, setMemberRequestError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null); // Stores ID of request being processed

  // State for Deny Reason Dialog
  const [isDenyReasonDialogOpen, setIsDenyReasonDialogOpen] = useState(false);
  const [requestIdToDeny, setRequestIdToDeny] = useState<number | null>(null);
  const [denialReason, setDenialReason] = useState<string>("");

  const [spaceUsers, setSpaceUsers] = useState<SpaceUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [startupsInSpace, setStartupsInSpace] = useState<BasicStartup[]>([]);
  const [isLoadingStartups, setIsLoadingStartups] = useState(true);

  // State for Add Workstation Modal
  const [isAddWorkstationModalOpen, setIsAddWorkstationModalOpen] = useState(false);
  const [addWorkstationData, setAddWorkstationData] = useState<WorkstationCreate>({ name: '', status: 'AVAILABLE' as WorkstationStatusType });
  const [addWorkstationError, setAddWorkstationError] = useState<string | null>(null);

  // State for Edit Workstation Modal
  const [isEditWorkstationModalOpen, setIsEditWorkstationModalOpen] = useState(false);
  const [selectedWorkstationForEdit, setSelectedWorkstationForEdit] = useState<WorkstationDetail | null>(null);
  const [editWorkstationData, setEditWorkstationData] = useState<WorkstationUpdate>({ name: undefined, status: undefined });
  const [editWorkstationError, setEditWorkstationError] = useState<string | null>(null);

  // State for Delete Workstation Dialog
  const [isDeleteWorkstationDialogOpen, setIsDeleteWorkstationDialogOpen] = useState(false);
  const [workstationToDelete, setWorkstationToDelete] = useState<WorkstationDetail | null>(null);
  const [deleteWorkstationError, setDeleteWorkstationError] = useState<string | null>(null);

  // State for Remove User Dialog
  const [userToRemove, setUserToRemove] = useState<BasicUser | null>(null);
  const [removeUserError, setRemoveUserError] = useState<string | null>(null);

  // New state for handling new Corp Admins without a space
  const [hasNoSpace, setHasNoSpace] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user || user.role !== 'CORP_ADMIN') return;

    setLoading(true);
    setError(null);
    setHasNoSpace(false);
    
    try {
      // First, try to get the space details. This is the gatekeeper.
      const spaceData = await getMyManagedSpace();
      setSpaceDetails(spaceData);
      setHasNoSpace(false); // Explicitly set to false on success

      // If successful, proceed to fetch all other data in parallel
      const [
        employeeData, 
        tenantData, 
        workstationData, 
        allUsersData, 
        connectionsData, 
        memberReqData,
        startupsData
      ] = await Promise.all([
        listMySpaceEmployees(),
        listMySpaceTenants(),
        listMySpaceWorkstations(),
        listAllUsersInMySpace(),
        getSpaceConnectionStats(),
        listPendingMemberRequests(true),
        getStartupsInMySpace()
      ]);

      setEmployees(employeeData);
      setTenants(tenantData.tenants);
      setWorkstations(workstationData.workstations);
      setAllSpaceUsers(allUsersData);
      setSpaceConnectionStats(connectionsData);
      setMemberRequests(memberReqData);
      setStartupsInSpace(startupsData);

    } catch (err: any) {
      if (err.response?.status === 404) {
        // This specifically handles the case where getMyManagedSpace returns a 404
        setHasNoSpace(true);
      } else {
        const errorMsg = err.response?.data?.detail || err.message || 'An unknown error occurred.';
        setError(errorMsg);
        toast.error("Dashboard Error", { description: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'CORP_ADMIN') {
      fetchData();
    }
  }, [user, isAuthenticated, fetchData]);

  const assignableUsers = useMemo(() => {
    if (!allSpaceUsers?.users) return [];
    const occupiedUserIds = new Set(workstations.filter(ws => ws.occupant).map(ws => ws.occupant?.id));
    return allSpaceUsers.users.filter(u => !occupiedUserIds.has(u.id));
  }, [allSpaceUsers, workstations]);

  const handleCreateFirstSpace = async () => {
    if (!newSpaceName.trim() || !user?.company_id) {
      toast.error("Space name is required.");
      return;
    }
    setIsCreatingSpace(true);
    try {
      await api.post('/admin/spaces', {
        name: newSpaceName,
        company_id: user.company_id,
        corporate_admin_id: user.id
      });
      toast.success("Your space has been created! Welcome.");
      setHasNoSpace(false);
      await fetchData(); 
    } catch (err: any) {
      toast.error("Failed to create space", {
        description: err.response?.data?.detail || "An unexpected error occurred."
      });
    } finally {
      setIsCreatingSpace(false);
    }
  };
  
  const handleDataRefresh = () => {
    fetchData();
  };
  
  const handleAssignUser = async () => {
    if (!selectedWorkstationIdForAssignment || !selectedUserIdForAssignment) {
      setAssignmentError("Workstation and user must be selected.");
      return;
    }
    setAssignmentError(null);
    try {
      await assignWorkstation(selectedWorkstationIdForAssignment, selectedUserIdForAssignment);
      toast.success("Workstation assigned successfully.");
      setIsAssignModalOpen(false);
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || "Failed to assign workstation.";
      setAssignmentError(errorMessage);
      toast.error("Assignment Failed", { description: errorMessage });
    }
  };

  const handleUnassignUser = async () => {
    if (!selectedWorkstationForUnassignment || !selectedWorkstationForUnassignment.occupant) return;
    try {
      await unassignWorkstation(selectedWorkstationForUnassignment.id);
      toast.success(`User unassigned from ${selectedWorkstationForUnassignment.name} successfully.`);
      setIsUnassignModalOpen(false);
      setSelectedWorkstationForUnassignment(null);
      await fetchData();
    } catch (err: any) {
      toast.error("Unassignment Failed", { description: err.response?.data?.detail || "Failed to unassign user." });
    }
  };

  const handleChangeWorkstationStatus = async () => {
    if (!selectedWorkstationForStatusChange || !selectedNewStatus) return;
    if (selectedNewStatus === 'OCCUPIED' && selectedWorkstationForStatusChange.status !== 'OCCUPIED') {
      toast.error("Cannot directly set status to OCCUPIED. Assign a user instead.");
      return;
    }
    try {
      await updateWorkstationStatus(selectedWorkstationForStatusChange.id, selectedNewStatus);
      toast.success(`Status of ${selectedWorkstationForStatusChange.name} updated to ${selectedNewStatus}.`);
      setIsChangeStatusModalOpen(false);
      setSelectedWorkstationForStatusChange(null);
      await fetchData();
    } catch (err: any) {
      toast.error("Status Update Failed", { description: err.response?.data?.detail || "Failed to update status." });
    }
  };
  
  const occupancyRate = useMemo(() => {
    if (!spaceDetails || spaceDetails.total_workstations === 0) return 0;
    return (spaceDetails.occupied_workstations / spaceDetails.total_workstations) * 100;
  }, [spaceDetails]);
  
  const handleApproveRequest = async (requestId: number) => {
    setActionInProgress(requestId);
    try {
      const response = await approveMemberRequest(requestId);
      toast.success(response.message || "Member request approved successfully.");
      await fetchData();
    } catch (err: any) {
      toast.error("Approval Failed", { description: err.response?.data?.detail || 'Failed to approve request.' });
    } finally {
      setActionInProgress(null);
    }
  };

  const confirmDenyRequest = async () => {
    if (requestIdToDeny === null) return;
    setActionInProgress(requestIdToDeny);
    try {
      const response = await rejectMemberRequest(requestIdToDeny, denialReason);
      toast.success(response.message || "Member request denied successfully.");
      await fetchData();
    } catch (err: any) {
      toast.error("Denial Failed", { description: err.response?.data?.detail || 'Failed to deny request.' });
    } finally {
      setActionInProgress(null);
      setIsDenyReasonDialogOpen(false);
    }
  };
  
  const handleRemoveUser = async () => {
    if (!userToRemove) return;
    try {
      await api.delete(`/spaces/me/users/${userToRemove.id}`);
      toast.success(`Successfully removed ${userToRemove.full_name || userToRemove.email} from the space.`);
      setUserToRemove(null);
      await fetchData();
    } catch (err: any) {
      toast.error("Removal Failed", { description: err.response?.data?.detail || "Failed to remove user." });
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading Corporate Dashboard...</p></div>;
  }

  if (hasNoSpace) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome! Let's Create Your First Space</CardTitle>
            <CardDescription>
              A 'Space' represents your physical office location where startups and freelancers will work.
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
    );
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500"><p>Error: {error}</p></div>;
  }

  if (user?.role !== 'CORP_ADMIN' || !spaceDetails) {
    return null; 
  }

  const startups = tenants.filter(isStartupTenant);
  const freelancers = tenants.filter(tenant => !isStartupTenant(tenant)) as FreelancerTenantInfo[];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'OCCUPIED': return 'destructive';
      case 'MAINTENANCE': return 'secondary';
      default: return 'outline';
    }
  };

  const getTruncatedUserDisplay = (user: BasicUser | null, maxLength = 25): string => {
    if (!user) return '-';
    const primaryDisplay = user.full_name || user.email;
    if (primaryDisplay.length <= maxLength) return primaryDisplay;
    return `${primaryDisplay.substring(0, maxLength)}...`;
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Corporate Admin Dashboard</h1>

      {/* Space Overview Section */}
      {spaceDetails && (
        <Card className="mb-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center"><Building className="mr-3 h-7 w-7 text-sky-400" />{spaceDetails.name}</CardTitle>
            <CardDescription className="text-slate-400">{spaceDetails.address || 'Address not specified'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
              <div>
                <p className="text-3xl font-semibold text-sky-300">{spaceDetails.total_workstations}</p>
                <p className="text-sm text-slate-400">Total Workstations</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-emerald-400">{spaceDetails.available_workstations}</p>
                <p className="text-sm text-slate-400">Available</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-amber-400">{spaceDetails.occupied_workstations}</p>
                <p className="text-sm text-slate-400">Occupied</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-rose-400">{spaceDetails.maintenance_workstations}</p>
                <p className="text-sm text-slate-400">Maintenance</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-purple-400 flex items-center justify-center">
                  <TrendingUp className="mr-2 h-7 w-7" /> 
                  {occupancyRate.toFixed(1)}%
                </p>
                <p className="text-sm text-slate-400">Occupancy Rate</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-teal-400 flex items-center justify-center">
                  <Users className="mr-2 h-7 w-7" />
                  {spaceConnectionStats ? spaceConnectionStats.total_connections : '-'}
                </p>
                <p className="text-sm text-slate-400">Total Connections</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="employees" className="mb-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="employees">My Company Employees</TabsTrigger>
          <TabsTrigger value="tenants">Startups & Freelancers</TabsTrigger>
          <TabsTrigger value="all_users">All Space Users</TabsTrigger>
          <TabsTrigger value="member_requests">Member Requests</TabsTrigger>
        </TabsList>

        {/* My Company Employees Tab */}
        <TabsContent value="employees">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>My Company's Employees</CardTitle>
              <CardDescription>Employees belonging to your company within this space.</CardDescription>
            </CardHeader>
            <CardContent>
              {employees.length > 0 ? (
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
                    {employees.map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell><Link href={`/dashboard/users/${emp.id}`} className="hover:underline text-blue-600 dark:text-blue-400">{emp.full_name || 'N/A'}</Link></TableCell>
                        <TableCell>{emp.email}</TableCell>
                        <TableCell>{emp.role}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="destructive" size="sm" onClick={() => setUserToRemove(emp)}>
                            Remove from Space
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>No company employees found in this space.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Startups in Space Tab */}
        <TabsContent value="tenants">
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle>Startups in Space</CardTitle>
              <CardDescription>Startups currently operating within your managed space.</CardDescription>
            </CardHeader>
            <CardContent>
              {startups.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Startup Name</TableHead>
                      <TableHead>Member Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {startups.map((startup) => (
                      <TableRow key={startup.details.id}>
                        <TableCell>{startup.details.name}</TableCell>
                        <TableCell>{startup.member_count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>No startups found in this space.</p>
              )}
            </CardContent>
          </Card>

          {/* Freelancers in Space - Moved here */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Freelancers in Space</CardTitle>
              <CardDescription>Individual freelancers operating within your managed space.</CardDescription>
            </CardHeader>
            <CardContent>
              {freelancers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {freelancers.map((freelancer) => (
                      <TableRow key={freelancer.details.id}>
                        <TableCell><Link href={`/dashboard/users/${freelancer.details.id}`} className="hover:underline text-blue-600 dark:text-blue-400">{freelancer.details.full_name || 'N/A'}</Link></TableCell>
                        <TableCell>{freelancer.details.email}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="destructive" size="sm" onClick={() => setUserToRemove(freelancer.details)}>
                              Remove from Space
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>No freelancers found in this space.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Space Users Tab */}
        <TabsContent value="all_users">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>All Users in Managed Space</CardTitle>
              <CardDescription>A comprehensive list of all users currently part of your managed space.</CardDescription>
            </CardHeader>
            <CardContent>
              {allSpaceUsers && allSpaceUsers.users.length > 0 ? (
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
                    {allSpaceUsers.users.map((usr) => (
                      <TableRow key={usr.id}>
                        <TableCell><Link href={`/dashboard/users/${usr.id}`} className="hover:underline text-blue-600 dark:text-blue-400">{usr.full_name || 'N/A'}</Link></TableCell>
                        <TableCell>{usr.email}</TableCell>
                        <TableCell>{usr.role}</TableCell>
                        <TableCell className="text-right">
                          {user?.id !== usr.id && (
                              <Button variant="destructive" size="sm" onClick={() => setUserToRemove(usr)}>
                                Remove from Space
                              </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>No users found in this space, or an error occurred fetching the list.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Member Requests Tab */}
        <TabsContent value="member_requests">
          <Card>
            <CardHeader>
              <CardTitle>Pending Member Join Requests</CardTitle>
              <CardDescription>
                Review and approve or deny requests from startups to add members to your space.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMemberRequests && <p>Loading requests...</p>}
              {memberRequestError && <p className="text-red-500">{memberRequestError}</p>}
              {!isLoadingMemberRequests && !memberRequestError && memberRequests.length === 0 && (
                <p>No pending member requests.</p>
              )}
              {!isLoadingMemberRequests && !memberRequestError && memberRequests.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request Details</TableHead>
                      <TableHead>Requested At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <div className="font-medium">{req.message}</div>
                          <div className="text-sm text-muted-foreground">Type: {req.type}</div>
                        </TableCell>
                        <TableCell>{new Date(req.created_at).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApproveRequest(req.id)}
                            disabled={actionInProgress === req.id}
                            className="mr-2"
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDenyRequest(req.id)}
                            disabled={actionInProgress === req.id}
                          >
                            <XCircle className="mr-1 h-4 w-4" /> Deny
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Workstation Management Section */}
      <Card className="mb-8 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center"><HardHat className="mr-3 h-6 w-6 text-blue-500" />Workstation Management</CardTitle>
            <CardDescription>View status, assign users, and manage all workstations in your space.</CardDescription>
          </div>
          <Button onClick={handleOpenAddWorkstationModal} variant="outline">
            <UserPlus className="mr-2 h-4 w-4" /> Add Workstation
          </Button>
        </CardHeader>
        <CardContent>
          {workstations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Occupant</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workstations.map((ws) => (
                  <TableRow key={ws.id}>
                    <TableCell className="font-medium">{ws.name}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(ws.status)}>{ws.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {ws.occupant ? (
                        <div>
                          <p>{ws.occupant.full_name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{ws.occupant.email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {ws.status === 'AVAILABLE' && (
                        <Button variant="outline" size="sm" onClick={() => handleOpenAssignModal(ws.id)} title="Assign User">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      )}
                      {ws.status === 'OCCUPIED' && (
                        <Button variant="outline" size="sm" onClick={() => handleOpenUnassignModal(ws)} title="Unassign User">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleOpenEditWorkstationModal(ws)} title="Edit Workstation">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleOpenDeleteWorkstationDialog(ws)} title="Delete Workstation">
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleOpenChangeStatusModal(ws)} title="Change Status">
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No workstations found in this space. Contact support to add workstations.</p>
          )}
        </CardContent>
      </Card>

      {/* Assign User Modal */}
      {selectedWorkstationForModal && (
        <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Assign User to Workstation: {selectedWorkstationForModal.name}</DialogTitle>
              <DialogDescription>
                Select a user to assign to this workstation. Only users not currently occupying another workstation are listed.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user-select" className="text-right">
                  User
                </Label>
                <Select
                  onValueChange={(value) => {
                    setSelectedUserIdForAssignment(value);
                    const userObj = assignableUsers.find(u => u.id === value);
                    setSelectedUserObjectForAssignment(userObj || null);
                  }}
                  value={selectedUserIdForAssignment}
                >
                  <SelectTrigger id="user-select" className="col-span-3">
                    <SelectValue>
                      {getTruncatedUserDisplay(selectedUserObjectForAssignment)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="overflow-hidden">
                    {assignableUsers.length > 0 ? (
                      assignableUsers.map(u => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.full_name || u.email} ({u.email})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-users" disabled>No assignable users found.</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {assignmentError && (
                <p className="col-span-4 text-sm text-red-500 text-center">{assignmentError}</p>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="button" onClick={handleAssignUser} disabled={!selectedUserIdForAssignment || assignableUsers.length === 0}>
                Assign User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Unassign User Modal */}
      {selectedWorkstationForUnassignment && (
        <Dialog open={isUnassignModalOpen} onOpenChange={setIsUnassignModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Unassignment</DialogTitle>
              <DialogDescription>
                Are you sure you want to unassign {selectedWorkstationForUnassignment.occupant?.full_name || selectedWorkstationForUnassignment.occupant?.email || 'the current user'} from workstation: <strong>{selectedWorkstationForUnassignment.name}</strong>?
              </DialogDescription>
            </DialogHeader>
            {unassignmentError && (
              <p className="py-2 text-sm text-red-500 text-center">{unassignmentError}</p>
            )}
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="button" variant="destructive" onClick={handleUnassignUser}>Confirm Unassign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Change Workstation Status Modal */}
      {selectedWorkstationForStatusChange && (
        <Dialog open={isChangeStatusModalOpen} onOpenChange={setIsChangeStatusModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Change Status for: {selectedWorkstationForStatusChange.name}</DialogTitle>
              <DialogDescription>
                Current Status: <Badge variant={getStatusBadgeVariant(selectedWorkstationForStatusChange.status)}>{selectedWorkstationForStatusChange.status}</Badge><br/>
                Select a new status for this workstation. 
                {selectedWorkstationForStatusChange.status === 'OCCUPIED' && (AVAILABLE_STATUSES.includes(selectedNewStatus || 'AVAILABLE')) && 'Changing status from OCCUPIED will unassign the current user.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status-select" className="text-right">New Status</Label>
                <Select 
                  onValueChange={(value) => setSelectedNewStatus(value as WorkstationStatusType)} 
                  value={selectedNewStatus}
                >
                  <SelectTrigger id="status-select" className="col-span-3">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_STATUSES.map(status => (
                      <SelectItem 
                        key={status} 
                        value={status} 
                        disabled={selectedWorkstationForStatusChange.status === 'OCCUPIED' && status === 'OCCUPIED'}
                      >
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {statusChangeError && (<p className="col-span-4 text-sm text-red-500 text-center">{statusChangeError}</p>)}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="button" onClick={handleChangeWorkstationStatus} disabled={!selectedNewStatus || selectedNewStatus === selectedWorkstationForStatusChange.status}>
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Deny Reason Dialog */}
      {isDenyReasonDialogOpen && (
      <Dialog open={isDenyReasonDialogOpen} onOpenChange={setIsDenyReasonDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Deny Member Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for denying this member request. This reason will be sent to the Startup Admin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="denialReason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="denialReason"
                value={denialReason}
                onChange={(e) => setDenialReason(e.target.value)}
                className="col-span-3"
                placeholder="Enter reason for denial (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDenyReasonDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmDenyRequest} disabled={actionInProgress === requestIdToDeny}>
              {actionInProgress === requestIdToDeny ? "Denying..." : "Confirm Denial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}

       <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center"><Users2 className="mr-2 h-5 w-5 text-purple-500"/>Find Talent for Your Space</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-slate-600 dark:text-slate-300 mb-3">Access tools to connect with recruiting agents and find talent.</p>
                <Link href="/dashboard/recruiting-placeholder">
                    <Button variant="secondary">Explore Recruiting Tools</Button>
                </Link>
            </CardContent>
        </Card>
         <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Subscription & Referrals</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-slate-600 dark:text-slate-300">View your company's plan, billing details, and referral credits.</p>
                <p className="text-sm text-slate-400 mt-2">(Details coming in a future update)</p>
            </CardContent>
        </Card>
      </div>
      
      <Dialog open={isAddWorkstationModalOpen} onOpenChange={setIsAddWorkstationModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Workstation</DialogTitle>
            <DialogDescription>Enter the details for the new workstation.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ws-name" className="text-right">
                Name
              </Label>
              <Input 
                id="ws-name" 
                value={addWorkstationData.name} 
                onChange={(e) => setAddWorkstationData({...addWorkstationData, name: e.target.value})} 
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ws-status" className="text-right">
                Status
              </Label>
              <Select 
                value={addWorkstationData.status}
                onValueChange={(value) => setAddWorkstationData({...addWorkstationData, status: value as WorkstationStatusType})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {workstationStatusOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {addWorkstationError && <p className="text-sm text-red-500 col-span-4 text-center">{addWorkstationError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddWorkstationModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateWorkstation}>Create Workstation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedWorkstationForEdit && (
        <Dialog open={isEditWorkstationModalOpen} onOpenChange={setIsEditWorkstationModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Workstation: {selectedWorkstationForEdit.name}</DialogTitle>
              <DialogDescription>Update the details for this workstation.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-ws-name" className="text-right">
                  Name
                </Label>
                <Input 
                  id="edit-ws-name" 
                  value={editWorkstationData.name || ''} 
                  onChange={(e) => setEditWorkstationData({...editWorkstationData, name: e.target.value})} 
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-ws-status" className="text-right">
                  Status
                </Label>
                <Select 
                  value={editWorkstationData.status}
                  onValueChange={(value) => setEditWorkstationData({...editWorkstationData, status: value as WorkstationStatusType})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {workstationStatusOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editWorkstationError && <p className="text-sm text-red-500 col-span-4 text-center">{editWorkstationError}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditWorkstationModalOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateWorkstation}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {workstationToDelete && (
        <Dialog open={isDeleteWorkstationDialogOpen} onOpenChange={setIsDeleteWorkstationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Workstation: {workstationToDelete.name}?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this workstation? This action cannot be undone.
                {workstationToDelete.status === 'OCCUPIED' && (
                    <p className="text-red-500 font-semibold mt-2">This workstation is currently occupied and cannot be deleted. Please unassign the user first.</p>
                )}
              </DialogDescription>
            </DialogHeader>
            {deleteWorkstationError && <p className="text-sm text-red-500 py-2 text-center">{deleteWorkstationError}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteWorkstationDialogOpen(false)}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteWorkstation} 
                disabled={workstationToDelete.status === 'OCCUPIED'}
              >
                Delete Workstation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <AssignWorkstationModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        workstationId={selectedWorkstationIdForAssignment}
        assignableUsers={assignableUsers} 
        onAssign={handleAssignUser}
        error={assignmentError}
        selectedUserId={selectedUserIdForAssignment}
        onUserSelect={setSelectedUserIdForAssignment}
      />

      {selectedWorkstationForUnassignment && (
          <Dialog open={isUnassignModalOpen} onOpenChange={setIsUnassignModalOpen}>
            <DialogOverlay />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Unassign User from {selectedWorkstationForUnassignment.name}?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to unassign {getTruncatedUserDisplay(selectedWorkstationForUnassignment.occupant)} from this workstation?
                </DialogDescription>
              </DialogHeader>
              {unassignmentError && <p className="text-red-500 text-sm">{unassignmentError}</p>}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUnassignModalOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleUnassignUser}>Confirm Unassignment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      )}

      {selectedWorkstationForStatusChange && (
        <ChangeWorkstationStatusModal 
          isOpen={isChangeStatusModalOpen}
          onClose={() => setIsChangeStatusModalOpen(false)}
          workstation={selectedWorkstationForStatusChange}
          currentStatus={selectedNewStatus || selectedWorkstationForStatusChange.status}
          onStatusChange={(newStatus) => setSelectedNewStatus(newStatus as WorkstationStatusType)}
          onSubmit={handleChangeWorkstationStatus}
          error={statusChangeError}
        />
      )}

      <AlertDialog open={!!userToRemove} onOpenChange={(isOpen) => !isOpen && setUserToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove {userToRemove?.full_name || userToRemove?.email} from your space. They will lose access to any assigned workstation and will need to be invited again to rejoin.
            </AlertDialogDescription>
            {removeUserError && <div className="text-red-500 text-sm mt-2">{removeUserError}</div>}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToRemove(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveUser} className="bg-destructive hover:bg-destructive/90">
              Yes, remove user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddUserToSpaceCard 
        startups={startupsInSpace} 
        onUserAdded={handleDataRefresh} 
      />
    </div>
  );
} 