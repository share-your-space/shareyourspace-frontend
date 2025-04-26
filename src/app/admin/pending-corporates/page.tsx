'use client';

import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { api } from '@/lib/api'; // Assuming an api client setup
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import ApproveCorporateDialog from '@/components/admin/ApproveCorporateDialog'; // We will create this next

interface PendingUser {
    id: number;
    email: string;
    full_name?: string;
    role: string;
    status: string;
    created_at: string;
}

export default function PendingCorporatesPage() {
    const [users, setUsers] = useState<PendingUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const fetchPendingUsers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get<PendingUser[]>('/admin/pending-corporates');
                setUsers(response.data);
            } catch (err: any) { // Added type annotation
                console.error("Error fetching pending users:", err);
                setError(err.response?.data?.detail || "Failed to fetch pending corporate users.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPendingUsers();
    }, []);

    const handleApproveClick = (user: PendingUser) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };

    const handleDialogClose = (refresh: boolean = false) => {
        setIsDialogOpen(false);
        setSelectedUser(null);
        if (refresh) {
            // Re-fetch users after successful approval
             const fetchPendingUsers = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const response = await api.get<PendingUser[]>('/admin/pending-corporates');
                    setUsers(response.data);
                } catch (err: any) {
                    console.error("Error fetching pending users:", err);
                    setError(err.response?.data?.detail || "Failed to fetch pending corporate users.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPendingUsers();
        }
    }

    return (
        <AuthenticatedLayout>
            <h1 className="text-3xl font-bold mb-6">Pending Corporate Approvals</h1>

            {isLoading && (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {!isLoading && !error && users.length === 0 && (
                <p>No pending corporate users found.</p>
            )}

            {!isLoading && !error && users.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Registered On</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.full_name || 'N/A'}</TableCell>
                                <TableCell>{user.status}</TableCell>
                                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    {/* Button to trigger approval dialog */}
                                    <Button onClick={() => handleApproveClick(user)}>Approve</Button>
                                    {/* Add View Details button later */}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {selectedUser && (
                <ApproveCorporateDialog
                    user={selectedUser}
                    isOpen={isDialogOpen}
                    onClose={handleDialogClose}
                />
            )}
        </AuthenticatedLayout>
    );
} 