"use client";

import { useEffect, useState } from 'react';
import { Invitation, InvitationStatus } from '@/types/auth';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { mockInvitations } from '@/lib/mock-data';

const StartupInvitationsManagement = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = () => {
    setIsLoading(true);
    setError(null);
    // Simulate API call
    setTimeout(() => {
      try {
        // Filter mock invitations for the startup
        const startupInvitations = mockInvitations.filter(inv => inv.startup_id === 1);
        setInvitations(startupInvitations);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch invitations.";
        setError(errorMessage);
        toast.error("Error", {
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleRevoke = async (invitationId: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      toast.success("Invitation Revoked", {
        description: `The invitation for ${invitations.find(inv => inv.id === invitationId)?.email} has been successfully revoked.`,
      });
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (error) {
      console.error("Failed to revoke invitation:", error);
      toast.error("Error", {
        description: "Failed to revoke invitation. Please try again.",
      });
    }
  };

  if (isLoading) return <p>Loading pending invitations...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const pendingInvitationsToDisplay = invitations.filter(
    inv => inv.status === InvitationStatus.PENDING && new Date(inv.expires_at) > new Date()
  );

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Pending Member Invitations</h3>
      {pendingInvitationsToDisplay.length === 0 ? (
        <p>No pending invitations.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Invited At</TableHead>
              <TableHead>Expires At</TableHead>
              <TableHead>Approved By (Admin)</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingInvitationsToDisplay.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>{inv.email}</TableCell>
                <TableCell>{format(new Date(inv.created_at), "MMM d, yyyy h:mm a")}</TableCell>
                <TableCell>{format(new Date(inv.expires_at), "MMM d, yyyy h:mm a")}</TableCell>
                <TableCell>{inv.approved_by_admin?.full_name || 'N/A'}</TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">Revoke</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will revoke the invitation for {inv.email}. They will no longer be able to use this invitation to join.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRevoke(inv.id)}>
                          Confirm Revoke
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default StartupInvitationsManagement;