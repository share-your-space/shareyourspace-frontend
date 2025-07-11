'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import AuthGuard from "@/components/layout/AuthGuard";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { UserDetail } from '@/types/auth';
import { getCurrentUserDetailedProfile } from '@/lib/api/users';
import UserProfileDisplay from '@/components/profile/UserProfileDisplay';
import { Separator } from '@/components/ui/separator';

const CorpAdminProfilePage = () => {
    const router = useRouter();
    const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const currentUser = useAuthStore(state => state.user);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            setError(null);
            try {
                if (currentUser) {
                    const data = await getCurrentUserDetailedProfile();
                    setUserDetail(data);
                } else {
                    // Handle case where user is not logged in, though AuthGuard should prevent this.
                    setError("You must be logged in to view this page.");
                }
            } catch (err: any) {
                console.error("Error fetching user profile:", err);
                setError(err.response?.data?.detail || "User profile not found or an error occurred.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [currentUser]);

    if (isLoading) {
        return (
            <AuthenticatedLayout>
                <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            </AuthenticatedLayout>
        );
    }

    if (error || !userDetail) {
        return (
            <AuthenticatedLayout>
                <div className="container mx-auto py-8 px-4 text-center">
                    <Alert variant="destructive" className="max-w-lg mx-auto">
                        <AlertTriangle className="h-5 w-5" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error || "Profile could not be loaded."}</AlertDescription>
                    </Alert>
                    <Button onClick={() => router.back()} variant="outline" className="mt-6">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthGuard>
            <AuthenticatedLayout>
                <div className="container mx-auto py-8 px-4 md:px-6 max-w-4xl">
                    <Button onClick={() => router.back()} variant="outline" size="sm" className="mb-6">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    
                    <UserProfileDisplay userDetail={userDetail} />
                </div>
            </AuthenticatedLayout>
        </AuthGuard>
    );
};

export default CorpAdminProfilePage; 