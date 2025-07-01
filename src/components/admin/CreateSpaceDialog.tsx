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

// We might need to fetch users to select a corporate admin
// For simplicity now, corporate_admin_id will be an optional number input

interface CreateSpaceDialogProps {
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
    companyId: number;
}

const CreateSpaceDialog: React.FC<CreateSpaceDialogProps> = ({ isOpen, onClose, companyId }) => {
    const [spaceName, setSpaceName] = useState('');
    const [spaceLocation, setSpaceLocation] = useState('');
    const [totalWorkstations, setTotalWorkstations] = useState('');
    const [corporateAdminId, setCorporateAdminId] = useState(''); // Optional
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Reset form when dialog opens
            setSpaceName('');
            setSpaceLocation('');
            setTotalWorkstations('10'); // Default value
            setCorporateAdminId('');
            setError(null);
        } else {
            // Also reset on close just in case
            setSpaceName('');
            setSpaceLocation('');
            setTotalWorkstations('');
            setCorporateAdminId('');
            setError(null);
        }
    }, [isOpen]);

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
                company_id: companyId,
            };
            if (adminId) {
                spacePayload.corporate_admin_id = adminId;
            }
            
            await api.post('/admin/spaces', spacePayload);
            toast.success(`Space '${spaceName}' created successfully!`);
            onClose(true); // Close dialog and refresh list

        } catch (err: any) {
            console.error("Error creating space:", err);
            const errorMessage = err.response?.data?.detail || err.message || "An unexpected error occurred.";
            setError(errorMessage);
            toast.error(`Space creation failed: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Create New Space</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new workspace.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="createSpaceName">Space Name</Label>
                        <Input 
                            id="createSpaceName" 
                            value={spaceName} 
                            onChange={(e) => setSpaceName(e.target.value)} 
                            placeholder="e.g., Innovation Hub Central"
                            required 
                        />
                    </div>
                    <div>
                        <Label htmlFor="createSpaceLocation">Space Location / Address (Optional)</Label>
                        <Input 
                            id="createSpaceLocation" 
                            value={spaceLocation} 
                            onChange={(e) => setSpaceLocation(e.target.value)} 
                            placeholder="e.g., Downtown Tech Park"
                        />
                    </div>
                    <div>
                        <Label htmlFor="createTotalWorkstations">Total Workstations</Label>
                        <Input 
                            id="createTotalWorkstations" 
                            type="number" 
                            value={totalWorkstations} 
                            onChange={(e) => setTotalWorkstations(e.target.value)} 
                            placeholder="e.g., 25"
                            required 
                            min="1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="createCorporateAdminId">Corporate Admin ID (Optional)</Label>
                        <Input 
                            id="createCorporateAdminId" 
                            type="number" 
                            value={corporateAdminId} 
                            onChange={(e) => setCorporateAdminId(e.target.value)} 
                            placeholder="Enter User ID of the admin for this space"
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
                            Create Space
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateSpaceDialog; 