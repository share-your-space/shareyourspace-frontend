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

interface PendingUser {
        id: number;
        email: string;
        full_name?: string;
    // Add other fields if needed for display
}

interface ApproveCorporateDialogProps {
    user: PendingUser | null;
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
}

const ApproveCorporateDialog: React.FC<ApproveCorporateDialogProps> = ({ user, isOpen, onClose }) => {
    const [spaceName, setSpaceName] = useState('');
    const [spaceLocation, setSpaceLocation] = useState(''); // Assuming location is a simple string for now
    const [totalWorkstations, setTotalWorkstations] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Reset form when dialog opens for a new user or closes
        if (isOpen && user) {
            setSpaceName(user.full_name ? `${user.full_name.split(' ')[0]}\'s Space` : 'New Corporate Space');
            setSpaceLocation('');
            setTotalWorkstations('10'); // Default value
            setError(null);
        } else if (!isOpen) {
            setSpaceName('');
            setSpaceLocation('');
            setTotalWorkstations('');
            setError(null);
        }
    }, [isOpen, user]);

    if (!user) return null;

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

        try {
            // Step 1: Create the SpaceNode
            // Backend expects: name, corporate_admin_id, total_workstations, (optional: location_description, company_id)
            // For now, location_description is spaceLocation. company_id is not handled in this simple dialog.
            const spacePayload = {
                name: spaceName,
                corporate_admin_id: user.id,
                total_workstations: workstations,
                location_description: spaceLocation || null, 
            };
            const spaceResponse = await api.post('/admin/spaces', spacePayload);
            const createdSpace = spaceResponse.data;

            if (!createdSpace || !createdSpace.id) {
                throw new Error("Failed to create space or space ID not returned.");
            }

            // Step 2: Activate the Corporate User and assign to space
            // Backend expects: space_id (and potentially other fields like role, status, is_active if they need setting)
            // The activate-corporate endpoint should handle setting role to CORP_ADMIN and status to ACTIVE.
            const activationPayload = {
                space_id: createdSpace.id,
            };
            await api.put(`/admin/users/${user.id}/activate-corporate`, activationPayload);

            toast.success(`User ${user.email} approved and space '${spaceName}' created successfully!`);
            onClose(true); // Close dialog and refresh list

        } catch (err: any) {
            console.error("Error approving corporate user:", err);
            const errorMessage = err.response?.data?.detail || err.message || "An unexpected error occurred.";
            setError(errorMessage);
            toast.error(`Approval failed: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Approve Corporate User & Create Space</DialogTitle>
                    <DialogDescription>
                        Approve user <span className="font-semibold">{user.email}</span> ({user.full_name || 'N/A'}) and set up their initial workspace.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="spaceName">Space Name</Label>
                            <Input
                                id="spaceName"
                                value={spaceName}
                                onChange={(e) => setSpaceName(e.target.value)}
                            placeholder="e.g., Pixida Munich Hub"
                                required
                            />
                        </div>
                    <div>
                        <Label htmlFor="spaceLocation">Space Location / Address (Optional)</Label>
                            <Input
                            id="spaceLocation" 
                            value={spaceLocation} 
                            onChange={(e) => setSpaceLocation(e.target.value)} 
                            placeholder="e.g., Central Business District"
                            />
                        </div>
                    <div>
                        <Label htmlFor="totalWorkstations">Total Workstations</Label>
                            <Input
                                id="totalWorkstations"
                                type="number"
                                value={totalWorkstations}
                                onChange={(e) => setTotalWorkstations(e.target.value)}
                            placeholder="e.g., 50"
                                required
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
                            Approve & Create Space
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ApproveCorporateDialog; 