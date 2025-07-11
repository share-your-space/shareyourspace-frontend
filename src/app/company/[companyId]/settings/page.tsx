'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Company, CompanyUpdate } from '@/types/organization';

const getInitials = (name?: string | null): string => {
    if (!name) return 'C';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

export default function CompanySettingsPage() {
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchCompanyDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/corp-admin/settings/details');
                if (!response.ok) throw new Error('Failed to fetch company details.');
                const data: Company = await response.json();
                setCompany(data);
            } catch (error) {
                console.error(error);
                toast.error('Could not load company settings.');
            } finally {
                setLoading(false);
            }
        };
        fetchCompanyDetails();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!company) return;
        const { id, value } = e.target;
        setCompany({ ...company, [id]: value });
    };

    const handleSaveChanges = async () => {
        if (!company) return;
        setSaving(true);
        try {
            const updatePayload: CompanyUpdate = {
                name: company.name,
                website: company.website,
            };
            const response = await fetch('/api/corp-admin/settings/details', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload),
            });
            if (!response.ok) throw new Error('Failed to save changes.');
            const updatedCompany: Company = await response.json();
            setCompany(updatedCompany);
            toast.success('Company profile updated successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('logo_file', file);

        try {
            const response = await fetch('/api/corp-admin/settings/logo', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('Failed to upload logo.');
            const updatedCompany: Company = await response.json();
            setCompany(updatedCompany);
            toast.success('Logo uploaded successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Logo upload failed. Please try a different file.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!company) {
        return <div className="text-center">Could not load company settings.</div>;
    }

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
                            <AvatarImage src={company.logo_url || undefined} alt={company.name} />
                            <AvatarFallback>{getInitials(company.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                            <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/png, image/jpeg, image/gif" className="hidden" />
                            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                Upload Logo
                            </Button>
                            <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 5MB.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Company Name</Label>
                            <Input id="name" value={company.name} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input id="website" value={company.website || ''} onChange={handleInputChange} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button onClick={handleSaveChanges} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
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
