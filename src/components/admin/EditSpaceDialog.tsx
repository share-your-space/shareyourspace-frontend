'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { AdminSpaceView } from '@/types/admin'; // Using the centralized type

interface EditSpaceDialogProps {
    space: AdminSpaceView | null;
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
}

const EditSpaceDialog: React.FC<EditSpaceDialogProps> = ({ space, isOpen, onClose }) => {
    const [spaceName, setSpaceName] = useState('');
    const [spaceLocation, setSpaceLocation] = useState('');
    const [totalWorkstations, setTotalWorkstations] = useState('');
    const [corporateAdminId, setCorporateAdminId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && space) {
            setSpaceName(space.name || '');
            setSpaceLocation(space.location_description || '');
            setTotalWorkstations(space.total_workstations?.toString() || '10');
            setCorporateAdminId(space.corporate_admin_id?.toString() || '');
            setError(null);
        } else if (!isOpen) {
            // Reset on close
            setSpaceName('');
            setSpaceLocation('');
            setTotalWorkstations('');
            setCorporateAdminId('');
            setError(null);
        }
    }, [isOpen, space]);

    if (!space) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        if (!spaceName || !totalWorkstations) {
            setError("Space Name and Total Workstations are required.");
            setIsSaving(false);
            return;
        }

        const workstations = parseInt(totalWorkstations, 10);
        if (isNaN(workstations) || workstations <= 0) {
            setError("Total Workstations must be a positive number.");
            setIsSaving(false);
            return;
        }

        const adminId = corporateAdminId ? parseInt(corporateAdminId, 10) : null;
        if (corporateAdminId && (isNaN(adminId as number) || (adminId as number) <= 0)) {
            setError("Corporate Admin ID must be a positive number if provided.");
            setIsSaving(false);
            return;
        }

        try {
            const spacePayload: any = {
                name: spaceName,
                total_workstations: workstations,
                location_description: spaceLocation || null,
            };
            if (adminId) {
                spacePayload.corporate_admin_id = adminId;
            } else {
                 // If adminId is cleared, we might need to explicitly pass null or an instruction to remove it
                 // Depending on backend PUT /admin/spaces/{space_id} logic for optional fields
                 spacePayload.corporate_admin_id = null; 
            }
            
            await api.put(`/admin/spaces/${space.id}`, spacePayload);
            toast.success(`Space '${spaceName}' updated successfully!`);
            onClose(true); // Close dialog and refresh list

        } catch (err: any) {
            console.error("Error updating space:", err);
            const errorMessage = err.response?.data?.detail || err.message || "An unexpected error occurred.";
            setError(errorMessage);
            toast.error(`Space update failed: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(openState) => !openState && onClose()}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Edit Space: {space.name}</DialogTitle>
                    <DialogDescription>
                        Update the details for this workspace.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="editSpaceName">Space Name</Label>
                        <Input 
                            id="editSpaceName" 
                            value={spaceName} 
                            onChange={(e) => setSpaceName(e.target.value)} 
                            placeholder="e.g., Innovation Hub Central"
                            required 
                        />
                    </div>
                    <div>
                        <Label htmlFor="editSpaceLocation">Space Location / Address (Optional)</Label>
                        <Input 
                            id="editSpaceLocation" 
                            value={spaceLocation} 
                            onChange={(e) => setSpaceLocation(e.target.value)} 
                            placeholder="e.g., Downtown Tech Park"
                        />
                    </div>
                    <div>
                        <Label htmlFor="editTotalWorkstations">Total Workstations</Label>
                        <Input 
                            id="editTotalWorkstations" 
                            type="number" 
                            value={totalWorkstations} 
                            onChange={(e) => setTotalWorkstations(e.target.value)} 
                            placeholder="e.g., 25"
                            required 
                            min="1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="editCorporateAdminId">Corporate Admin ID (Optional)</Label>
                        <Input 
                            id="editCorporateAdminId" 
                            type="number" 
                            value={corporateAdminId} 
                            onChange={(e) => setCorporateAdminId(e.target.value)} 
                            placeholder="Enter User ID or leave blank"
                            min="1"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 bg-red-100 p-2 rounded-md">{error}</p>
                    )}

                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={() => onClose()}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSaving} >
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditSpaceDialog; 