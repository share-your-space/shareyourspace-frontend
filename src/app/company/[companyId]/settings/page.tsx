'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from 'lucide-react';

const getInitials = (name?: string | null): string => {
    if (!name) return 'C';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

export default function CompanySettingsPage() {
    const companyName = "Innovate Inc."; // Mock data

    return (
        <div className="space-y-8">
            {/* Company Profile Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Company Profile</CardTitle>
                    <CardDescription>Update your company&apos;s profile information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-6">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src="/placeholder-logo.png" alt={companyName} />
                            <AvatarFallback>{getInitials(companyName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                            <Button variant="outline">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Logo
                            </Button>
                            <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 5MB.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input id="companyName" defaultValue={companyName} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="companyWebsite">Website</Label>
                            <Input id="companyWebsite" defaultValue="https://innovateinc.com" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button>Save Changes</Button>
                </CardFooter>
            </Card>

            {/* Danger Zone Section */}
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle>Danger Zone</CardTitle>
                    <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border border-destructive/50 p-4">
                        <div>
                            <h3 className="font-semibold">Delete Company</h3>
                            <p className="text-sm text-muted-foreground">
                                This will permanently delete the company, including all its data, members, and connections.
                            </p>
                        </div>
                        <Button variant="destructive" className="mt-2 sm:mt-0">Delete this Company</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
