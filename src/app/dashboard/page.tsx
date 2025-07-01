"use client";

import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import AuthGuard from "@/components/layout/AuthGuard";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api"; // Import the api client
import { Button } from "@/components/ui/button"; // Import Button component
import { useRouter } from "next/navigation"; // Import useRouter
import Link from "next/link"; // Import Link for navigation
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardFooter, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card"; // Import Card components
import { Input } from "@/components/ui/input"; // Import Input
import { Label } from "@/components/ui/label"; // Import Label
import { type UserAuthInfo } from "@/store/authStore"; // Or from '@/types/user';
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
import { Loader2, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";
import { getOrCreateConversation } from "@/lib/api/chat";
import { getStartup } from "@/lib/api/organizations";
import { Startup } from "@/types/organization";
import DirectInviteMemberForm from "@/components/dashboard/startup-admin/DirectInviteMemberForm";
import StartupInvitationsManagement from "@/components/dashboard/startup-admin/StartupInvitationsManagement";

// Define a type for team members
interface TeamMember {
  id: number;
  full_name?: string;
  email: string;
  role?: string;
  // Add other relevant fields you want to display
}

const DashboardPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]); // State for team members
  const [teamMembersLoading, setTeamMembersLoading] = useState<boolean>(false); // Loading state
  const [teamMembersError, setTeamMembersError] = useState<string | null>(null); // Error state
  const [spaceAdmin, setSpaceAdmin] = useState<{ id: number; full_name: string } | null>(null);
  const [startup, setStartup] = useState<Startup | null>(null);

  // State for Request Add Member form
  const [newMemberEmail, setNewMemberEmail] = useState<string>("");
  const [requestMemberLoading, setRequestMemberLoading] = useState<boolean>(false);
  const [requestMemberMessage, setRequestMemberMessage] = useState<string | null>(null);
  const [requestMemberError, setRequestMemberError] = useState<string | null>(null);

  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [workstationRequestLoading, setWorkstationRequestLoading] = useState<number | null>(null);
  const [pendingJoinRequestsCount, setPendingJoinRequestsCount] = useState(0);

  const user = useAuthStore((state) => state.user); // Get the full user object from the store
  const router = useRouter(); // Initialize useRouter
  const isLoadingAuth = useAuthStore((state) => state.isLoading);

  // Effect for CORP_ADMIN redirection - relies on user from store
  useEffect(() => {
    if (user?.role === 'CORP_ADMIN') {
      router.replace('/dashboard/corporate-admin');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchSpaceAdmin = async () => {
      if (user?.space_id) {
        try {
          // This endpoint needs to be created or verified
          const response = await api.get(`/spaces/${user.space_id}/admin`);
          setSpaceAdmin(response.data);
        } catch (err) {
          console.error("Failed to fetch space admin", err);
        }
      }
    };
    fetchSpaceAdmin();
  }, [user]);

  useEffect(() => {
    const fetchStartupDetails = async () => {
        if (user?.startup_id) {
            try {
                const startupData = await getStartup(user.startup_id);
                setStartup(startupData);
            } catch (err) {
                console.error("Failed to fetch startup details", err);
            }
        }
    };
    if (user?.role === 'STARTUP_ADMIN') {
        fetchStartupDetails();
    }
  }, [user]);

    const fetchTeamMembers = async () => {
      if (user && user.role === 'STARTUP_ADMIN' && user.status !== 'WAITLISTED' && user.startup_id) {
        setTeamMembersLoading(true);
        setTeamMembersError(null);
        try {
          const [membersResponse, requestsResponse] = await Promise.all([
            api.get<TeamMember[]>('/organizations/startups/me/members'),
            api.get<any[]>('/join-requests') // Assuming this returns an array of request objects
          ]);
          setTeamMembers(membersResponse.data);
          setPendingJoinRequestsCount(requestsResponse.data.length);
        } catch (err: any) {
          console.error("Failed to fetch startup data:", err);
          setTeamMembersError(err.response?.data?.detail || err.message || "Failed to load team members.");
        }
        setTeamMembersLoading(false);
      }
    };

  // Fetch team members if the user is a Startup Admin AND NOT waitlisted
  useEffect(() => {
    if (user?.role === 'STARTUP_ADMIN' && user.status !== 'WAITLISTED') {
        fetchTeamMembers();
    }
  }, [user]);

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await api.delete(`/organizations/startups/me/members/${memberToRemove.id}`);
      // Refresh the list of members
      fetchTeamMembers();
      setMemberToRemove(null); // Close the dialog
    } catch (err: any) {
      console.error("Failed to remove member:", err);
      // You could set an error state here to show in the UI
      setTeamMembersError(err.response?.data?.detail || err.message || "Failed to remove member.");
      setMemberToRemove(null); // Close the dialog
    }
  };

  const handleRequestWorkstation = async (memberId: number) => {
    setWorkstationRequestLoading(memberId);
    try {
      // This endpoint needs to be created
      await api.post(`/workstations/request-assignment`, { user_id: memberId });
      toast.success("Workstation request sent to the Corporate Admin.");
    } catch (err: any) {
      toast.error("Failed to request workstation", {
        description: err.response?.data?.detail || "An unexpected error occurred.",
      });
    } finally {
      setWorkstationRequestLoading(null);
    }
  };

  const handleContactAdmin = async () => {
    if (spaceAdmin) {
      try {
        const conversation = await getOrCreateConversation(spaceAdmin.id);
        router.push(`/chat?conversationId=${conversation.id}`);
      } catch (error) {
        toast.error("Failed to start a conversation with the space admin.");
      }
    } else {
      toast.error("Could not find the space admin to contact at this time.");
    }
  };

  const handleRequestAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (user?.status === 'WAITLISTED') {
      setRequestMemberError("This feature will be available once your startup is active in a space.");
      return;
    }
    if (!newMemberEmail) {
      setRequestMemberError("Please enter the email address of the member you wish to add.");
      return;
    }
    setRequestMemberLoading(true);
    setRequestMemberError(null);
    setRequestMemberMessage(null);

    try {
      const response = await api.post("/organizations/startups/me/request-member", { email: newMemberEmail });
      setRequestMemberMessage(response.data.message || "Member request submitted successfully.");
      setNewMemberEmail(""); 
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || "Failed to submit member request.";
      setRequestMemberError(errorMessage);
      // Only log to console if it's not a 404 error, or if there's no specific user-facing message
      if (err.response?.status !== 404) {
      console.error("Failed to request add member:", err);
      } else if (!err.response?.data?.detail) {
        // If it is a 404 but we didn't get a detail message from backend, still log the original error
        console.error("Failed to request add member (404, no detail):", err);
      }
    }
    setRequestMemberLoading(false);
  };

  const showContactAdminButton = user && spaceAdmin && user.id !== spaceAdmin.id;

  const showStartupFreelancerFeatures = user && 
                                       (user.role === 'STARTUP_ADMIN' || 
                                        user.role === 'STARTUP_MEMBER' || 
                                        user.role === 'FREELANCER');
                                        
  const isStartupAdmin = user && user.role === 'STARTUP_ADMIN';
  const isWaitlisted = user?.status === 'WAITLISTED';

  if (user?.role === 'CORP_ADMIN') {
    return <div className="flex justify-center items-center h-screen"><p>Redirecting to Corporate Admin dashboard...</p></div>;
  }
  
  if (isLoadingAuth && !user) {
      return <div className="flex justify-center items-center h-screen"><p>Loading dashboard...</p></div>;
  }

  return (
    <AuthGuard>
      <AuthenticatedLayout>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {isStartupAdmin && user.startup_id && (
            <Link href={`/startups/${user.startup_id}`} passHref>
                <Button variant="outline">View Startup Profile</Button>
            </Link>
          )}
        </div>
        {user ? (
          <div>
            <p>Welcome, {user.full_name || "User"}!</p>
            <p>Role: {user.role}</p> 
            <p>Status: <span className={isWaitlisted ? "font-semibold text-orange-500" : "text-green-500"}>{user.status}</span></p>
            {user.current_workstation ? (
              <p>Workstation: <span className="font-semibold text-blue-600">{user.current_workstation.workstation_name} (ID: {user.current_workstation.workstation_id})</span></p>
            ) : (
              !isWaitlisted && (
                <p>Workstation: <span className="text-gray-500">(Not yet assigned)</span></p>
              )
            )}
            {isWaitlisted && (
              <Card className="mt-4 border-orange-500">
                <CardHeader>
                  <CardTitle className="text-orange-600">You are Currently Waitlisted</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Your access is currently limited. Full platform features, including space interaction, matching, and chat, 
                    will become available once a space provider invites you or your application is approved for a space.
                    You can manage your profile information below.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <p>Loading user data or not authenticated...</p> 
        )}
        
        {/* Common features available to waitlisted users (like profile management) */}
        <div className="mt-8 p-6 border rounded-lg bg-card text-card-foreground shadow-md">
            <h2 className="text-2xl font-semibold mb-4">My Account</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Manage Your Profile</h3>
                <p className="text-sm text-muted-foreground mb-3">Keep your personal and professional details up to date.</p>
                <Link href="/profile" passHref>
                  <Button variant="outline">View/Edit My Profile</Button>
                </Link>
              </div>
              
              {/* "Contact Space Admin" Button - Conditionally shown */}
              {showContactAdminButton ? (
                <div>
                  <h3 className="text-lg font-medium mb-2">Support</h3>
                  <p className="text-sm text-muted-foreground mb-3">Need help with your space or have questions for the admin, {spaceAdmin.full_name}?</p>
                  <Button onClick={handleContactAdmin} variant="default" id="[CH-04]">
                    <MessageSquare className="mr-2 h-4 w-4" /> Contact Space Admin
                  </Button>
                </div>
              ) : !isWaitlisted && (
                 <div>
                    <h3 className="text-lg font-medium mb-2 text-muted-foreground">Support</h3>
                    <p className="text-sm text-muted-foreground mb-3">The space admin contact is not available at this moment.</p>
                    <Button variant="outline" disabled>Contact Space Admin</Button>
                 </div>
              )}
            </div>
        </div>

        {/* Startup Admin Specific Features - with waitlist handling */}
        {isStartupAdmin && (
          <div className="mt-8 p-6 border rounded-lg bg-card text-card-foreground shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Startup Administration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div id="view-team-members-section">
                <h3 className="text-xl font-semibold mb-3">Team Members</h3>
                {isWaitlisted ? (
                  <p className="text-sm text-muted-foreground">This feature will be available once your startup is active in a space.</p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">View and manage members of your startup.</p>
                    {teamMembersLoading && <p>Loading team members...</p>}
                    {teamMembersError && <p className="text-red-500">Error: {teamMembersError}</p>}
                    {!teamMembersLoading && !teamMembersError && (
                      teamMembers.length > 0 ? (
                        <Card>
                          <CardContent className="pt-4">
                            <ul className="space-y-2">
                              {teamMembers.map((member) => (
                                <li key={member.id} className="flex justify-between items-center p-2 border rounded">
                                  <div>
                                    <p className="font-medium">{member.full_name || "N/A"}</p>
                                    <p className="text-xs text-muted-foreground">{member.email}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRequestWorkstation(member.id)}
                                      disabled={workstationRequestLoading === member.id}
                                    >
                                      {workstationRequestLoading === member.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request Workstation"}
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => setMemberToRemove(member)}>
                                      Remove
                                    </Button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">Your team is ready to assemble!</p>
                          <p className="text-xs mt-1">Use the "Recruitment" section to invite your first member.</p>
                        </div>
                      )
                    )}
                  </>
                )}
              </div>

              <div id="request-add-member-section">
                <h3 className="text-xl font-semibold mb-3">Recruitment</h3>
                {isWaitlisted ? (
                  <p className="text-sm text-muted-foreground">This feature will be available once your startup is active in a space.</p>
                ) : (
                  <DirectInviteMemberForm onInvitationSent={fetchTeamMembers} />
                )}
              </div>
            </div>
            {!isWaitlisted && (
                <div className="mt-6">
                    <StartupInvitationsManagement />
                </div>
            )}
          </div>
        )}

        {/* General Error display, if any was set by a waitlisted user trying a feature */}
        {error && (
          <div className="mt-4 p-3 border rounded-md bg-destructive/10 text-destructive">
            <p>{error}</p>
          </div>
        )}

        <AlertDialog open={!!memberToRemove} onOpenChange={(isOpen) => !isOpen && setMemberToRemove(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently remove {memberToRemove?.full_name || memberToRemove?.email} from your startup and they will lose access to the space.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setMemberToRemove(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemoveMember} className="bg-destructive hover:bg-destructive/90">
                Yes, remove member
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </AuthenticatedLayout>
    </AuthGuard>
  );
};

export default DashboardPage; 