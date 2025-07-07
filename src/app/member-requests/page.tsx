'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import AuthGuard from '@/components/layout/AuthGuard';
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

const MemberRequestsPage = () => {
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

    if (isLoading) {
        return <div className="text-center p-8">Loading member requests...</div>;
    }

    return (
        <AuthGuard>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6">Incoming Member Requests</h1>
                {requests.length > 0 ? (
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
                ) : (
                    <p className="text-gray-500">No pending member requests.</p>
                )}
            </div>
        </AuthGuard>
    );
};

export default MemberRequestsPage; 