'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Image as ImageIcon, MapPin, Wifi, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

export default function SpaceProfilePage() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Briefcase className="mr-3 h-6 w-6" />
                        Manage Your Space Profile
                    </CardTitle>
                    <CardDescription>This is the information that potential tenants and members will see.</CardDescription>
                </CardHeader>
            </Card>

            {/* Gallery Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Photo Gallery</CardTitle>
                    <CardDescription>Showcase your space with high-quality images.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="relative aspect-video rounded-lg overflow-hidden">
                            <Image src="/placeholder-image.png" alt="Space photo 1" layout="fill" objectFit="cover" />
                        </div>
                         <div className="relative aspect-video rounded-lg overflow-hidden">
                            <Image src="/placeholder-image.png" alt="Space photo 2" layout="fill" objectFit="cover" />
                        </div>
                         <div className="relative aspect-video rounded-lg overflow-hidden">
                            <Image src="/placeholder-image.png" alt="Space photo 3" layout="fill" objectFit="cover" />
                        </div>
                        <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed flex items-center justify-center">
                           <Button variant="outline" size="sm"><ImageIcon className="mr-2 h-4 w-4"/>Add Photos</Button>
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
                        <Input id="spaceName" defaultValue="The Innovation Hub" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Public Description</Label>
                        <Textarea id="description" placeholder="Describe what makes your space unique..." rows={5} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" defaultValue="123 Tech Street, Silicon Valley, CA 94107" />
                    </div>
                </CardContent>
            </Card>

            {/* Amenities Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Amenities</CardTitle>
                    <CardDescription>Select the amenities you offer.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                        <Wifi className="h-5 w-5 text-primary" />
                        <span>High-Speed WiFi</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                        <Coffee className="h-5 w-5 text-primary" />
                        <span>Free Coffee & Tea</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <span>Meeting Rooms</span>
                    </div>
                     <Button variant="secondary" className="h-full">Manage Amenities</Button>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button size="lg">Save All Changes</Button>
            </div>
        </div>
    );
}
