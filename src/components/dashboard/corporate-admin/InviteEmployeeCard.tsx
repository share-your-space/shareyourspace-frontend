'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface InviteEmployeeCardProps {
    onEmployeeInvited: () => void;
}

export default function InviteEmployeeCard({ onEmployeeInvited }: InviteEmployeeCardProps) {
    const [email, setEmail] = useState('');

    const handleInvite = async () => {
        if (!email) {
            toast.error("Please enter an email address.");
            return;
        }
        
        // Simulate sending an invitation
        console.log(`Simulating invitation for: ${email}`);
        toast.success(`Invitation sent to ${email}`);
        setEmail('');
        onEmployeeInvited();
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
                    />
                    <Button onClick={handleInvite}>
                        Invite
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}