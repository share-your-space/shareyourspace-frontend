"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSpaceProfile } from '@/lib/api/spaces';
import { SpaceProfile as SpaceProfileType } from '@/types/space';
import { PhotoGallery } from '@/components/corp-admin/space-profile/PhotoGallery';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Mail, CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/authStore';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { expressInterest, getInterestStatus } from '@/lib/api/interests';
import { toast } from 'sonner';
import { getMe } from '@/lib/api/users';
import { UserDetail } from '@/types/auth';

const SpaceProfilePage = () => {
    const params = useParams();
    const router = useRouter();
    const spaceId = Number(params.id);
    const { user: authUser } = useAuthStore();

    const [profile, setProfile] = useState<SpaceProfileType | null>(null);
    const [currentUser, setCurrentUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasExpressedInterest, setHasExpressedInterest] = useState(false);

    useEffect(() => {
        if (isNaN(spaceId)) return;
        
        const fetchProfileAndUser = async () => {
            try {
                const profileData = await getSpaceProfile(spaceId.toString());
                setProfile(profileData);

                if (authUser && (authUser.role === 'FREELANCER' || authUser.role === 'STARTUP_ADMIN')) {
                    const status = await getInterestStatus(spaceId);
                    setHasExpressedInterest(status.has_expressed_interest);
                    
                    const me = await getMe();
                    setCurrentUser(me);
                }
            } catch (error) {
                console.error("Failed to fetch space profile or user details:", error);
                toast.error("Failed to load page data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileAndUser();
    }, [spaceId, authUser]);

    const handleExpressInterest = async () => {
        try {
            await expressInterest(spaceId);
            toast.success("Your interest has been expressed!");
            setHasExpressedInterest(true);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to express interest.");
        }
    };

    const isAlreadyInSpace = 
        (currentUser?.role === 'FREELANCER' && currentUser.space_id === spaceId) ||
        (currentUser?.role === 'STARTUP_ADMIN' && currentUser.startup?.space_id === spaceId);

    const canExpressInterest = authUser && 
                               (authUser.role === 'FREELANCER' || authUser.role === 'STARTUP_ADMIN') &&
                               !isAlreadyInSpace;

    if (loading) {
        return <AuthenticatedLayout><div>Loading...</div></AuthenticatedLayout>;
    }

    if (!profile) {
        return <AuthenticatedLayout><div>Space not found.</div></AuthenticatedLayout>;
    }

    const canEdit = authUser?.role === 'CORP_ADMIN' && authUser?.company_id === profile.company?.id;

    return (
        <AuthenticatedLayout>
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
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{profile.name}</h1>
                        <p className="mt-2 text-lg text-gray-500">{profile.headline}</p>

                        <Separator className="my-6" />

                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold">About this space</h2>
                                <p className="mt-2 text-gray-600 prose max-w-none">{profile.description}</p>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Amenities</h2>
                                <ul className="mt-2 grid grid-cols-2 gap-2">
                                    {profile.amenities?.map((amenity, index) => (
                                        <li key={index} className="flex items-center text-gray-600">
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                            {amenity}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">House Rules</h2>
                                <p className="mt-2 text-gray-600 prose max-w-none">{profile.house_rules}</p>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-1">
                        <div className="sticky top-24">
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Interested in this space?</h3>
                                {canExpressInterest ? (
                                    <div className="mt-4">
                                        {hasExpressedInterest ? (
                                            <Button className="w-full" disabled>
                                                <CheckCircle className="mr-2 h-4 w-4" /> Interest Expressed
                                            </Button>
                                        ) : (
                                            <Button className="w-full" onClick={handleExpressInterest}>
                                                <Mail className="mr-2 h-4 w-4" /> Express Interest
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    isAlreadyInSpace && (
                                        <p className="mt-4 text-sm font-medium text-gray-700">
                                            You are already a member of this space.
                                        </p>
                                    )
                                )}
                                <p className="mt-4 text-sm text-gray-500">
                                    Expressing interest will notify the space admin, who can then review your profile and start a conversation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default SpaceProfilePage;