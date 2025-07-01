'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { AdminUserView } from '@/types/admin'; // Using the centralized type

interface ChangeUserStatusDialogProps {
    user: AdminUserView | null;
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
}

// Define available roles and statuses based on AdminUserView type for consistency
const ROLES: AdminUserView['role'][] = ["SYS_ADMIN", "CORP_ADMIN", "CORP_EMPLOYEE", "STARTUP_ADMIN", "STARTUP_MEMBER", "FREELANCER"];
const STATUSES: AdminUserView['status'][] = ["PENDING_VERIFICATION", "WAITLISTED", "PENDING_ONBOARDING", "ACTIVE", "SUSPENDED", "BANNED"];

export default function ChangeUserStatusDialog({ user, isOpen, onClose }: ChangeUserStatusDialogProps) {
    const [selectedRole, setSelectedRole] = useState<AdminUserView['role'] | ''>(user?.role || '');
    const [selectedStatus, setSelectedStatus] = useState<AdminUserView['status'] | ''>(user?.status || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setSelectedRole(user.role || '');
            setSelectedStatus(user.status || '');
        }
    }, [user]);

    if (!user) return null;

    const handleSubmit = async () => {
        if (!selectedRole || !selectedStatus) {
            toast.error("Please select both a role and a status.");
            return;
        }
        setIsSubmitting(true);
        try {
            await api.put(`/admin/users/${user.id}/status`, { 
                role: selectedRole,
                status: selectedStatus,
                // is_active will likely be handled by the backend based on status
            });
            toast.success(`User ${user.full_name || user.email} status updated successfully.`);
            onClose(true); // Close and refresh
        } catch (error: any) {
            console.error("Failed to update user status:", error);
            toast.error(error.response?.data?.detail || "Failed to update user status.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Status for {user.full_name || user.email}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">Role</Label>
                        <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AdminUserView['role'])}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">Status</Label>
                        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as AdminUserView['status'])}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" onClick={() => onClose()}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !selectedRole || !selectedStatus}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 