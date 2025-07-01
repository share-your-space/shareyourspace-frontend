'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Check, X, Loader2, MailQuestion } from 'lucide-react';
import { toast } from 'sonner';

interface JoinRequestNotification {
    id: number;
    message: string;
    created_at: string;
    requesting_user: {
        id: number;
        full_name: string;
        email: string;
        profile: {
            profile_picture_url?: string | null;
        } | null;
    } | null;
}

export default function MemberRequestsPage() {
    const [requests, setRequests] = useState<JoinRequestNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // This endpoint needs to be created on the backend
            const response = await api.get('/join-requests');
            setRequests(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to load join requests.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (notificationId: number) => {
        const toastId = toast.loading("Approving request...");
        try {
            await api.post(`/join-requests/${notificationId}/approve`);
            toast.success("Request Approved", { id: toastId });
            fetchRequests(); // Refresh the list
        } catch (err: any) {
            toast.error("Approval Failed", { id: toastId, description: err.response?.data?.detail });
        }
    };

    const handleDecline = async (notificationId: number) => {
        const toastId = toast.loading("Declining request...");
        try {
            await api.post(`/join-requests/${notificationId}/decline`);
            toast.info("Request Declined", { id: toastId });
            fetchRequests(); // Refresh the list
        } catch (err: any) {
            toast.error("Decline Failed", { id: toastId, description: err.response?.data?.detail });
        }
    };

    return (
        <AuthenticatedLayout>
            <div className="container mx-auto py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Member Join Requests</CardTitle>
                        <CardDescription>Review and approve or decline requests from users who want to join your organization.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center items-center py-10">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : error ? (
                            <p className="text-destructive text-center">{error}</p>
                        ) : requests.length === 0 ? (
                            <div className="text-center py-10">
                                <MailQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-medium text-muted-foreground">No pending requests</h3>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {requests.map(req => (
                                    <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <Avatar>
                                                <AvatarImage src={req.requesting_user?.profile?.profile_picture_url || undefined} />
                                                <AvatarFallback>{req.requesting_user?.full_name?.charAt(0) || '?'}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{req.requesting_user?.full_name}</p>
                                                <p className="text-sm text-muted-foreground">{req.requesting_user?.email}</p>
                                                <p className="text-sm text-muted-foreground italic mt-1">"{req.message}"</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button size="sm" variant="outline" onClick={() => handleDecline(req.id)}>
                                                <X className="h-4 w-4 mr-2" /> Decline
                                            </Button>
                                            <Button size="sm" onClick={() => handleApprove(req.id)}>
                                                <Check className="h-4 w-4 mr-2" /> Approve
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
} 