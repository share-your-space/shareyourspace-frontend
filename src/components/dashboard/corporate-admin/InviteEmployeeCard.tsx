'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface InviteEmployeeCardProps {
    onEmployeeInvited: () => void;
}

export default function InviteEmployeeCard({ onEmployeeInvited }: InviteEmployeeCardProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInvite = async () => {
        if (!email) {
            toast.error("Please enter an email address.");
            return;
        }
        setIsLoading(true);
        try {
            const response = await api.post('/spaces/me/invite-employee', { email });
            toast.success(response.data.message || "Invitation sent successfully!");
            setEmail('');
            onEmployeeInvited();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } }, message?: string };
            toast.error("Failed to send invitation", {
                description: error.response?.data?.detail || error.message || "An unknown error occurred.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Invite New Employee</CardTitle>
                <CardDescription>
                    Send an invitation to a new employee to join your company and space.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input
                        type="email"
                        placeholder="employee@yourcompany.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button onClick={handleInvite} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Invite
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
} 