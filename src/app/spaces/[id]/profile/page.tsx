"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Space } from '@/types/space';
import { PhotoGallery } from '@/components/corp-admin/space-profile/PhotoGallery';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Mail, CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { mockSpaces, mockUsers } from '@/lib/mock-data';
import { UserDetail } from '@/types/auth';
import { UserRole } from '@/types/enums';

const SpaceProfilePage = () => {
    const params = useParams();
    const router = useRouter();
    const spaceId = Number(params.id);
    const { user: authUser } = useAuthStore();

    const [profile, setProfile] = useState<Space | null>(null);
    const [currentUser, setCurrentUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasExpressedInterest, setHasExpressedInterest] = useState(false);

    useEffect(() => {
        if (isNaN(spaceId)) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        const spaceData = mockSpaces.find(s => s.id === spaceId);
        setProfile(spaceData || null);

        if (authUser) {
            const user = mockUsers.find(u => u.id === authUser.id);
            if(user) {
                const userDetailData: UserDetail = {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    is_active: user.is_active,
                    is_verified: user.is_verified,
                    profile: user.profile!,
                    company: user.company || null,
                    startup: user.startup,
                    spaces: user.spaces,
                    interests: [],
                    company_id: user.company?.id,
                };
                setCurrentUser(userDetailData);
            }
        }
        
        // Simulate checking interest status
        if (authUser && (authUser.role === UserRole.FREELANCER || authUser.role === UserRole.STARTUP_ADMIN)) {
            const interestExpressed = localStorage.getItem(`interest_${spaceId}_${authUser.id}`);
            setHasExpressedInterest(!!interestExpressed);
        }

        setLoading(false);
    }, [spaceId, authUser]);

    const handleExpressInterest = async () => {
        toast.success("Your interest has been expressed!");
        localStorage.setItem(`interest_${spaceId}_${authUser?.id}`, 'true');
        setHasExpressedInterest(true);
    };

    const isAlreadyInSpace = 
        (currentUser?.role === UserRole.FREELANCER && currentUser.spaces?.some(s => s.id === spaceId)) ||
        (currentUser?.role === UserRole.STARTUP_ADMIN && currentUser.startup?.space_id === spaceId);

    const canExpressInterest = authUser && 
                               (authUser.role === UserRole.FREELANCER || authUser.role === UserRole.STARTUP_ADMIN) &&
                               !isAlreadyInSpace;

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!profile) {
        return <div className="flex justify-center items-center min-h-screen">Space not found.</div>;
    }

    const canEdit = authUser?.role === UserRole.CORP_ADMIN && authUser?.company?.id === profile.company_id;

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <Button onClick={() => router.back()} variant="outline" size="sm" className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <div className="relative mb-6">
                <PhotoGallery 
                    images={profile.images.map(img => ({ ...img, url: img.image_url }))}
                    isEditing={false}
                    onImageUpload={() => {}}
                    onImageDelete={() => {}}
                />
                {canEdit && (
                    <Button
                        onClick={() => router.push(`/corp-admin/space-profile`)}
                        className="absolute top-4 right-4"
                    >
                        <Edit className="mr-2 h-4 w-4" /> Manage Space
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">{profile.name}</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{profile.headline}</p>
                    <p className="mt-4 text-base text-gray-500 dark:text-gray-300">{profile.address}</p>
                    
                    <Separator className="my-6" />

                    <div>
                        <h2 className="text-2xl font-semibold mb-4">About the Space</h2>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{profile.neighborhood_description}</p>
                    </div>

                    <Separator className="my-6" />

                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Key Highlights</h2>
                        <ul className="list-disc list-inside space-y-2">
                            {profile.key_highlights.map((highlight, index) => (
                                <li key={index} className="text-gray-700 dark:text-gray-300">{highlight}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="md:col-span-1">
                    <div className="sticky top-24 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4">Interested?</h2>
                        {canExpressInterest ? (
                            hasExpressedInterest ? (
                                <div className="flex items-center text-green-600">
                                    <CheckCircle className="mr-2 h-5 w-5" />
                                    <span>Interest Expressed</span>
                                </div>
                            ) : (
                                <Button onClick={handleExpressInterest} className="w-full">
                                    <Mail className="mr-2 h-4 w-4" /> Express Interest
                                </Button>
                            )
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {isAlreadyInSpace ? "You are already a member of this space." : "Log in as a freelancer or startup to express interest."}
                            </p>
                        )}
                        <Separator className="my-4" />
                        <h3 className="font-semibold mb-2">Amenities</h3>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {profile.amenities.map((amenity, index) => (
                                <li key={index}>{amenity}</li>
                            ))}
                        </ul>
                        <Separator className="my-4" />
                        <h3 className="font-semibold mb-2">Opening Hours</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{profile.opening_hours}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpaceProfilePage;