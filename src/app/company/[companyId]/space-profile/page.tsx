"use client";

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Space, SpaceImage } from "@/types/space";
import { Wifi, Coffee, Users, Loader2, Trash2, ImagePlus } from 'lucide-react';
import Image from 'next/image';
import { mockSpaces } from '@/lib/mock-data';
import { useAuthStore } from '@/store/authStore';

const allAmenities = [
    { id: 'wifi', name: 'High-Speed WiFi', icon: Wifi },
    { id: 'coffee', name: 'Free Coffee & Tea', icon: Coffee },
    { id: 'meeting_room', name: 'Meeting Rooms', icon: Users },
    // ... add other amenities from your original list if needed
];

const SpaceProfilePage = () => {
    const { user } = useAuthStore();
    const companySpaces = useMemo(() => mockSpaces.filter(s => s.company_id === user?.company_id), [user?.company_id]);

    const [spaces, setSpaces] = useState<Space[]>(companySpaces);
    const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(companySpaces.length > 0 ? companySpaces[0].id : null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedSpace = useMemo(() => spaces.find(s => s.id === selectedSpaceId), [spaces, selectedSpaceId]);

    const handleSpaceChange = (spaceIdStr: string) => {
        setSelectedSpaceId(spaceIdStr);
    };

    const updateSelectedSpace = (field: keyof Space, value: Space[keyof Space]) => {
        if (!selectedSpaceId) return;
        setSpaces(prevSpaces =>
            prevSpaces.map(s =>
                s.id === selectedSpaceId ? { ...s, [field]: value } : s
            )
        );
    };

    const handleAmenityToggle = (amenityId: string) => {
        if (!selectedSpace) return;
        const currentAmenities = selectedSpace.amenities || [];
        const amenity = allAmenities.find(a => a.id === amenityId);
        if (!amenity) return;

        const newAmenities = currentAmenities.some(a => a.id === amenityId)
            ? currentAmenities.filter(a => a.id !== amenityId)
            : [...currentAmenities, {id: amenity.id, name: amenity.name}];
        updateSelectedSpace('amenities', newAmenities);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'key_highlights' || name === 'house_rules' || name === 'vibe') {
            updateSelectedSpace(name as keyof Space, value.split(',').map(s => s.trim()));
        } else {
            updateSelectedSpace(name as keyof Space, value);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !selectedSpace) return;
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            const newImage: SpaceImage = {
                id: `new-img-${Date.now()}`,
                image_url: reader.result as string,
                signed_url: reader.result as string,
            };
            const newImages = [...(selectedSpace.images || []), newImage];
            updateSelectedSpace('images', newImages);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = (imageId: string) => {
        if (!selectedSpace) return;
        const updatedImages = (selectedSpace.images || []).filter(img => img.id !== imageId);
        updateSelectedSpace('images', updatedImages);
        toast.success("Image removed.");
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedSpace) return;
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        setIsSubmitting(false);
        toast.success(`Space "${selectedSpace.name}" updated successfully!`);
    };

    if (companySpaces.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No Spaces Found</CardTitle>
                    <CardDescription>There are no spaces configured for this company.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>Create First Space</Button>
                </CardContent>
            </Card>
        );
    }

    if (!selectedSpace) {
        // This case should ideally not be hit if companySpaces.length > 0
        // But it's good practice to handle it.
        return <div>Loading space...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex-1">
                    <Label htmlFor="space-select">Select a Space to Edit</Label>
                    <Select onValueChange={handleSpaceChange} defaultValue={selectedSpace.id.toString()}>
                        <SelectTrigger id="space-select" className="w-full md:w-1/2 lg:w-1/3 mt-1">
                            <SelectValue placeholder="Select a space..." />
                        </SelectTrigger>
                        <SelectContent>
                            {spaces.map(space => (
                                <SelectItem key={space.id} value={space.id.toString()}>
                                    {space.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Update the core details of your space.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Space Name</Label>
                        <Input id="name" name="name" value={selectedSpace.name} onChange={handleFormChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="headline">Headline</Label>
                        <Input id="headline" name="headline" value={selectedSpace.headline || ''} onChange={handleFormChange} placeholder="e.g., Vibrant hub for creatives" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Full Description</Label>
                        <Textarea id="description" name="description" value={selectedSpace.description || ''} onChange={handleFormChange} rows={5} placeholder="Describe what makes your space unique..." />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Space Images</CardTitle>
                    <CardDescription>A picture is worth a thousand words. Show off your space.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {(selectedSpace.images || []).map(image => (
                            <div key={image.id} className="relative group">
                                <Image src={image.image_url} alt={`Space image ${image.id}`} width={200} height={150} className="rounded-lg object-cover w-full h-32" />
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="destructive" size="icon" onClick={() => handleRemoveImage(image.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-32 text-muted-foreground hover:bg-accent">
                            <ImagePlus className="h-8 w-8" />
                            <span>Add Image</span>
                        </Label>
                        <Input id="image-upload" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Amenities & Vibe</CardTitle>
                    <CardDescription>Let people know what you offer and the feel of your space.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label className="font-semibold">Amenities</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                            {allAmenities.map(amenity => (
                                <Button
                                    key={amenity.id}
                                    variant={selectedSpace.amenities?.some(a => a.id === amenity.id) ? "secondary" : "outline"}
                                    onClick={() => handleAmenityToggle(amenity.id)}
                                    className="justify-start"
                                >
                                    <amenity.icon className="mr-2 h-4 w-4" />
                                    {amenity.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="vibe">Vibe (comma-separated)</Label>
                        <Input
                            id="vibe"
                            name="vibe"
                            value={selectedSpace?.vibe?.join(', ') || ''}
                            onChange={handleFormChange}
                            placeholder="e.g. Energetic, Collaborative"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="key_highlights">Key Highlights (comma-separated)</Label>
                        <Textarea
                            id="key_highlights"
                            name="key_highlights"
                            value={selectedSpace?.key_highlights?.join(', ') || ''}
                            onChange={handleFormChange}
                            placeholder="e.g. 24/7 Access, Pet-Friendly"
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="house_rules">House Rules (comma-separated)</Label>
                        <Textarea
                            id="house_rules"
                            name="house_rules"
                            value={selectedSpace?.house_rules?.join(', ') || ''}
                            onChange={handleFormChange}
                            placeholder="e.g. Be respectful, Clean up"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    );
};

export default SpaceProfilePage;
