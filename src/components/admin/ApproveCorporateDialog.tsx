'use client';

import React, { useState } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { api } from '@/lib/api';

interface ApproveCorporateDialogProps {
    user: {
        id: number;
        email: string;
        full_name?: string;
    };
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
}

const ApproveCorporateDialog: React.FC<ApproveCorporateDialogProps> = ({ user, isOpen, onClose }) => {
    const [spaceName, setSpaceName] = useState('');
    const [location, setLocation] = useState('');
    const [totalWorkstations, setTotalWorkstations] = useState<number | string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const workstations = parseInt(totalWorkstations as string, 10);
        if (isNaN(workstations) || workstations <= 0) {
            setError("Total workstations must be a positive number.");
            setIsLoading(false);
            return;
        }

        try {
            // 1. Create the Space
            const spaceResponse = await api.post('/admin/spaces', {
                name: spaceName,
                location_description: location,
                corporate_admin_id: user.id,
                total_workstations: workstations
            });

            const spaceId = spaceResponse.data.id;

            // 2. Activate the Corporate User and assign to space
            await api.put(`/admin/users/${user.id}/activate-corporate?space_id=${spaceId}`);

            // Success
            console.log(`Successfully approved ${user.email} and created space ${spaceId}`);
            onClose(true); // Close dialog and trigger refresh

        } catch (err: any) {
            console.error("Error approving corporate user:", err);
            setError(err.response?.data?.detail || "Failed to approve user and create space.");
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form when dialog opens/closes or user changes
    React.useEffect(() => {
        if (isOpen) {
            setSpaceName('');
            setLocation('');
            setTotalWorkstations('');
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}> {/* Call onClose when closing */}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Approve Corporate User & Define Space</DialogTitle>
                    <DialogDescription>
                        Approve user <strong>{user.email}</strong> and create their initial space.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="spaceName" className="text-right">
                                Space Name
                            </Label>
                            <Input
                                id="spaceName"
                                value={spaceName}
                                onChange={(e) => setSpaceName(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="location" className="text-right">
                                Location
                            </Label>
                            <Input
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g., Munich Office, Floor 3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="totalWorkstations" className="text-right">
                                Total Workstations
                            </Label>
                            <Input
                                id="totalWorkstations"
                                type="number"
                                value={totalWorkstations}
                                onChange={(e) => setTotalWorkstations(e.target.value)}
                                className="col-span-3"
                                required
                                min="1"
                            />
                        </div>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter>
                        <DialogClose asChild>
                           <Button type="button" variant="outline" onClick={() => onClose()}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Approve & Create Space
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ApproveCorporateDialog; 