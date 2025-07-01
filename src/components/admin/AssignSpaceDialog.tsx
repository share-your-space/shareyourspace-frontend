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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface UserForSpaceAssignment {
    id: number; // User ID can be number or string depending on your User type
    email: string;
    current_space_id?: number | string | null; 
}

interface Space {
    id: number;
    name: string;
    // Add other relevant space fields if needed for display
}

interface AssignSpaceDialogProps {
    user: UserForSpaceAssignment | null;
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
}

const AssignSpaceDialog: React.FC<AssignSpaceDialogProps> = ({ user, isOpen, onClose }) => {
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
    const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && user) {
            setIsLoadingSpaces(true);
            setError(null);
            api.get<Space[]>('/admin/spaces') // Assuming this endpoint lists all spaces
                .then(response => {
                    setSpaces(response.data);
                    // Pre-select current user's space if available
                    if (user.current_space_id) {
                        setSelectedSpaceId(String(user.current_space_id));
                    } else {
                        setSelectedSpaceId(''); // Reset if no current space
                    }
                })
                .catch(err => {
                    console.error("Error fetching spaces:", err);
                    setError(err.response?.data?.detail || "Failed to fetch available spaces.");
                    toast.error("Could not load spaces.");
                    setSpaces([]);
                })
                .finally(() => setIsLoadingSpaces(false));
        } else if (!isOpen) {
            setError(null);
            setSelectedSpaceId('');
            // Do not clear spaces list here, it can be kept for next open unless explicitly desired
        }
    }, [isOpen, user]);

    if (!user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSpaceId) {
            setError("Please select a space to assign.");
            return;
        }
        setIsSaving(true);
        setError(null);

        try {
            // Backend endpoint: PUT /admin/users/{user_id}/assign-space
            // Backend payload might just be space_id in body, or query param - check backend spec
            // Assuming payload is { space_id: ... }
            await api.put(`/admin/users/${user.id}/assign-space`, { space_id: parseInt(selectedSpaceId, 10) });
            toast.success(`User ${user.email} successfully assigned to space ID ${selectedSpaceId}.`);
            onClose(true); // Close dialog and refresh list
        } catch (err: any) {
            console.error("Error assigning space:", err);
            const errorMessage = err.response?.data?.detail || err.message || "An unexpected error occurred while assigning space.";
            setError(errorMessage);
            toast.error(`Assignment failed: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Space to User</DialogTitle>
                    <DialogDescription>
                        Assign <span className="font-semibold">{user.email}</span> to an available space.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="spaceSelect">Select Space</Label>
                        {isLoadingSpaces ? (
                            <div className="flex items-center space-x-2 mt-1">
                                <Loader2 className="h-4 w-4 animate-spin" /> 
                                <span>Loading spaces...</span>
                            </div>
                        ) : spaces.length > 0 ? (
                            <Select 
                                value={selectedSpaceId} 
                                onValueChange={setSelectedSpaceId}
                                required
                            >
                                <SelectTrigger id="spaceSelect">
                                    <SelectValue placeholder="Choose a space..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {spaces.map(space => (
                                        <SelectItem key={space.id} value={String(space.id)}>
                                            {space.name} (ID: {space.id})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="text-sm text-muted-foreground mt-1">No spaces available or failed to load.</p>
                        )}
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 bg-red-100 p-2 rounded-md">{error}</p>
                    )}

                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={() => onClose()}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSaving || isLoadingSpaces || spaces.length === 0}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Assign Space
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AssignSpaceDialog; 