"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload } from 'lucide-react';

const SpaceProfilePage = () => {
    // Mock data for the space profile
    const spaceProfile = {
        name: 'Innovate Hub',
        description: 'A vibrant co-working space for tech startups and freelancers. We offer a collaborative environment with modern amenities to help your business grow.',
        address: '123 Tech Street, Silicon Valley, CA 94107',
        website: 'https://innovatehub.com',
        logoUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026707d',
    };

    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Space Profile</CardTitle>
                    <CardDescription>Update your space's profile information. This will be visible to potential tenants.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={spaceProfile.logoUrl} alt={spaceProfile.name} />
                            <AvatarFallback>{spaceProfile.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Button variant="outline">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Logo
                        </Button>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Space Name</Label>
                        <Input id="name" defaultValue={spaceProfile.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" defaultValue={spaceProfile.description} rows={4} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" defaultValue={spaceProfile.address} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input id="website" defaultValue={spaceProfile.website} />
                    </div>
                    <Button>Save Changes</Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default SpaceProfilePage;
