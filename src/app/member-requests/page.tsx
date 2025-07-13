'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Check, X, Loader2, MailQuestion } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types/enums';

interface JoinRequest {
    id: number;
    message: string;
    created_at: string;
    requesting_user: {
        id: number;
        full_name: string;
        email: string;
        profile_picture_url?: string | null;
    };
}

const mockJoinRequests: JoinRequest[] = [
    {
        id: 1,
        message: "I'd like to join your company, Innovate Inc.",
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        requesting_user: {
            id: 101,
            full_name: "Alice Developer",
            email: "alice.dev@example.com",
            profile_picture_url: "https://i.pravatar.cc/150?u=alice"
        }
    },
    {
        id: 2,
        message: "Heard great things about QuantumLeap AI and would love to be a part of the team.",
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        requesting_user: {
            id: 102,
            full_name: "Bob Designer",
            email: "bob.design@example.com",
            profile_picture_url: "https://i.pravatar.cc/150?u=bob"
        }
    }
];

const MemberRequestsPage = () => {
    const [requests, setRequests] = useState<JoinRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthStore();

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            // In a real app, you'd filter requests for the admin's company.
            // Here, we'll just show all for demo purposes.
            setRequests(mockJoinRequests);
            setIsLoading(false);
        }, 1000);
    }, []);

    const handleRequest = (requestId: number, action: 'approve' | 'decline') => {
        const toastId = toast.loading(`${action === 'approve' ? 'Approving' : 'Declining'} request...`);
        
        setTimeout(() => {
            setRequests(prev => prev.filter(req => req.id !== requestId));
            toast.success(`Request ${action === 'approve' ? 'approved' : 'declined'} successfully.`, { id: toastId });
        }, 1500);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Only admins should see this page
    if (user?.role !== UserRole.CORP_ADMIN && user?.role !== UserRole.STARTUP_ADMIN) {
        return (
            <div className="container mx-auto p-4 text-center">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>You do not have permission to view this page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Only company administrators can manage join requests.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Incoming Member Requests</h1>
            {requests.length > 0 ? (
                <div className="space-y-4">
                    {requests.map(req => (
                        <Card key={req.id}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={req.requesting_user.profile_picture_url || undefined} />
                                        <AvatarFallback>{req.requesting_user.full_name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{req.requesting_user.full_name}</p>
                                        <p className="text-sm text-muted-foreground">{req.requesting_user.email}</p>
                                        <p className="text-sm text-muted-foreground italic mt-1">&quot;{req.message}&quot;</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => handleRequest(req.id, 'decline')}>
                                        <X className="h-4 w-4 mr-2" /> Decline
                                    </Button>
                                    <Button size="sm" onClick={() => handleRequest(req.id, 'approve')}>
                                        <Check className="h-4 w-4 mr-2" /> Approve
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="text-center p-8">
                    <MailQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Pending Requests</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        There are no new requests to join your organization.
                    </p>
                </Card>
            )}
        </div>
    );
};

export default MemberRequestsPage;