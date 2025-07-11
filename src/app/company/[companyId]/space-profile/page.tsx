'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Wifi, Coffee, Loader2, AlertCircle, Users, Utensils, Printer, Sofa, Phone, Car, ConciergeBell, Mail, Clock, Calendar, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { Space } from '@/types/space';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

export default function SpaceProfilePage() {
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = useAuthStore((state) => state.token);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchSpaces = async () => {
            if (!token) {
                setLoading(false);
                setError("Authentication token not found.");
                return;
            }
            try {
                setLoading(true);
                const response = await fetch('/api/corp-admin/spaces', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch spaces');
                const fetchedData: Space[] = await response.json();
                setSpaces(fetchedData);
                if (fetchedData.length > 0) {
                    setSelectedSpace(fetchedData[0]);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };
        fetchSpaces();
    }, [token]);

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

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedSpace || !token) return;

        const formData = new FormData();
        formData.append('image_file', file);

        try {
            const response = await fetch(`/api/corp-admin/spaces/${selectedSpace.id}/images`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to upload image.');
            }

            const newImage = await response.json();
            setSelectedSpace(prev => ({
                ...prev!,
                images: [...(prev?.images || []), newImage],
            }));
            toast.success("Image uploaded successfully!");

        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'An unknown error occurred');
        }
    };

    const handleSaveChanges = async () => {
        if (!selectedSpace || !token) {
            toast.error("No space selected or not authenticated.");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`/api/corp-admin/spaces/${selectedSpace.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: selectedSpace.name,
                    description: selectedSpace.description,
                    address: selectedSpace.address,
                    amenities: selectedSpace.amenities,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to save changes.');
            }

            const updatedSpace = await response.json();

            // Update the local state with the saved data
            setSpaces(spaces.map(s => s.id === updatedSpace.id ? updatedSpace : s));
            setSelectedSpace(updatedSpace);

            toast.success("Space profile updated successfully!");

        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsSaving(false);
        }
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 flex items-center justify-center gap-2"><AlertCircle className="h-5 w-5" /> {error}</div>;
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Briefcase className="mr-3 h-6 w-6" />
                        Manage Your Space Profile
                    </CardTitle>
                    <CardDescription>Select a space to view and edit its public profile.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select onValueChange={handleSpaceChange} defaultValue={selectedSpace?.id.toString()}>
                        <SelectTrigger className="w-[280px]">
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
                </CardContent>
            </Card>

            {!selectedSpace ? (
                <div className="text-center py-10 text-muted-foreground">
                    <p>Select a space to see its details or create one if you haven't already.</p>
                </div>
            ) : (
                <>
                    {/* Gallery Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Photo Gallery</CardTitle>
                            <CardDescription>Showcase your space with high-quality images.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {selectedSpace.images?.map((img) => (
                                    <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden">
                                        <Image src={img.image_url} alt={`Space photo ${img.id}`} layout="fill" objectFit="cover" />
                                    </div>
                                ))}
                                <div 
                                    className="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleImageUpload}
                                        className="hidden" 
                                        accept="image/png, image/jpeg, image/gif"
                                    />
                                    <Button variant="outline" size="sm"><Upload className="mr-2 h-4 w-4"/>Upload</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Space Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="spaceName">Space Name</Label>
                                <Input id="spaceName" value={selectedSpace.name} onChange={(e) => setSelectedSpace({...selectedSpace, name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Public Description</Label>
                                <Textarea id="description" value={selectedSpace.description || ''} onChange={(e) => setSelectedSpace({...selectedSpace, description: e.target.value})} placeholder="Describe what makes your space unique..." rows={5} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" value={selectedSpace.address || ''} onChange={(e) => setSelectedSpace({...selectedSpace, address: e.target.value})} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Amenities Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Amenities</CardTitle>
                            <CardDescription>Select the amenities you offer.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {allAmenities.map(amenity => {
                                const Icon = amenity.icon;
                                const isSelected = selectedSpace.amenities?.includes(amenity.id);
                                return (
                                    <Button
                                        key={amenity.id}
                                        variant={isSelected ? "default" : "outline"}
                                        onClick={() => handleAmenityToggle(amenity.id)}
                                        className="h-auto justify-start"
                                    >
                                        <div className="flex items-center gap-3 p-2">
                                            <Icon className={`h-6 w-6 ${isSelected ? '' : 'text-muted-foreground'}`} />
                                            <span className="text-sm font-medium">{amenity.name}</span>
                                        </div>
                                    </Button>
                                );
                            })}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button size="lg" onClick={handleSaveChanges} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                `Save Changes for ${selectedSpace.name}`
                            )}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
