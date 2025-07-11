"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { Space } from "@/types/space";
import { apiClient } from "@/lib/api/base";
import { PackageOpen, Upload, Wifi, Coffee, Users, Loader2, AlertCircle, Briefcase, Utensils, Printer, Sofa, Phone, Car, ConciergeBell, Mail, Clock, Calendar } from 'lucide-react';
import Image from 'next/image';

const allAmenities = [
    { id: 'wifi', name: 'High-Speed WiFi', icon: Wifi },
    { id: 'coffee', name: 'Free Coffee & Tea', icon: Coffee },
    { id: 'meeting_room', name: 'Meeting Rooms', icon: Users },
    { id: 'kitchen', name: 'Kitchenette', icon: Utensils },
    { id: 'printer', name: 'Printer & Scanner', icon: Printer },
    { id: 'lounge', name: 'Lounge Area', icon: Sofa },
    { id: 'phone_booth', name: 'Phone Booths', icon: Phone },
    { id: 'parking', name: 'Parking', icon: Car },
    { id: 'reception', name: 'Reception Services', icon: ConciergeBell },
    { id: 'mail_service', name: 'Mail Handling', icon: Mail },
    { id: 'twenty_four_seven_access', name: '24/7 Access', icon: Clock },
    { id: 'event_space', name: 'Event Space', icon: Calendar },
];

const SpaceProfilePage = () => {
    const { companyId } = useParams<{ companyId: string }>();
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);

    const fetchSpaces = useCallback(async () => {
        if (!companyId || !token) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<Space[]>(`/company/${companyId}/spaces`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setSpaces(response.data);
            if (response.data.length > 0) {
                setSelectedSpace(response.data[0]);
            }
        } catch (err) {
            setError("Failed to load spaces. Please try again.");
            toast.error("Failed to load spaces.");
        } finally {
            setIsLoading(false);
        }
    }, [companyId, token]);

    useEffect(() => {
        fetchSpaces();
    }, [fetchSpaces]);

    const handleSpaceChange = (spaceId: string) => {
        const space = spaces.find(s => s.id.toString() === spaceId);
        setSelectedSpace(space || null);
    };

    const handleAmenityToggle = (amenityId: string) => {
        if (!selectedSpace) return;

        const currentAmenities = selectedSpace.amenities || [];
        const newAmenities = currentAmenities.includes(amenityId)
            ? currentAmenities.filter(a => a !== amenityId)
            : [...currentAmenities, amenityId];

        setSelectedSpace({ ...selectedSpace, amenities: newAmenities });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!selectedSpace) return;
        const { name, value } = e.target;
        setSelectedSpace({ ...selectedSpace, [name]: value });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !selectedSpace) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        setIsSubmitting(true);
        try {
            const response = await apiClient.post<{ signed_url: string }>(`/spaces/${selectedSpace.id}/upload-image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSelectedSpace({
                ...selectedSpace,
                images: [...(selectedSpace.images || []), { id: Date.now(), url: response.data.signed_url, signed_url: response.data.signed_url }]
            });
            toast.success("Image uploaded successfully!");
        } catch (uploadError) {
            toast.error("Image upload failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateSpace = async () => {
        if (!selectedSpace) return;
        setIsSubmitting(true);
        try {
            const { id, ...updateData } = selectedSpace;
            await apiClient.put(`/spaces/${id}`, updateData);
            toast.success("Space updated successfully!");
            fetchSpaces(); // Refresh data
        } catch (updateError) {
            toast.error("Failed to update space.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 flex items-center justify-center gap-2"><AlertCircle className="h-5 w-5" /> {error}</div>;
    }

    return (
        <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Briefcase className="mr-3 h-6 w-6" />
                            Your Spaces
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {spaces.length > 0 ? (
                            <Select onValueChange={handleSpaceChange} defaultValue={selectedSpace?.id.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a space" />
                                </SelectTrigger>
                                <SelectContent>
                                    {spaces.map(space => (
                                        <SelectItem key={space.id} value={space.id.toString()}>
                                            {space.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="text-sm text-muted-foreground">No spaces found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="md:col-span-9">
                <Card>
                    {selectedSpace ? (
                        <>
                            <CardHeader>
                                <CardTitle>Edit Space Profile</CardTitle>
                                <CardDescription>Update the details for {selectedSpace.name}.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Space Name</Label>
                                    <Input id="name" name="name" value={selectedSpace.name} onChange={handleFormChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" name="description" value={selectedSpace.description || ''} onChange={handleFormChange} />
                                </div>
                                
                                <div className="space-y-4">
                                    <Label>Images</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {(selectedSpace.images || []).map(image => (
                                            <div key={image.id} className="relative">
                                                <Image src={image.signed_url} alt="Space" layout="fill" className="rounded-md object-cover" />
                                            </div>
                                        ))}
                                        <Label htmlFor="image-upload" className="flex flex-col items-center justify-center border-2 border-dashed rounded-md cursor-pointer h-32 hover:bg-accent">
                                            <Upload className="h-8 w-8 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">Upload</span>
                                            <Input id="image-upload" type="file" className="sr-only" onChange={handleImageUpload} disabled={isSubmitting} />
                                        </Label>
                                    </div>
                                </div>

                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button onClick={handleUpdateSpace} disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </>
                    ) : (
                        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                            <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">No Space Selected</h3>
                            <p>Select a space to see its details or create one if you haven&apos;t already.</p>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default SpaceProfilePage;
