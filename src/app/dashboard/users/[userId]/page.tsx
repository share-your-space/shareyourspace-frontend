'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserDetail } from '@/types/auth';
import { getUserDetailedProfile } from '@/lib/api/users'; 
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import UserProfileDisplay from '@/components/profile/UserProfileDisplay';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      const fetchUserProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const numericUserId = parseInt(userId, 10);
          if (isNaN(numericUserId)) {
            setError("Invalid user ID.");
            setIsLoading(false);
            return;
          }
          const data = await getUserDetailedProfile(numericUserId);
          setUserDetail(data);
        } catch (err: any) {
          setError(err.response?.data?.detail || err.message || "Failed to load user profile.");
          console.error("Error fetching user profile:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserProfile();
    } else {
      setError("User ID is missing.");
      setIsLoading(false);
    }
  }, [userId]);

  if (isLoading) {
    return <div className="container mx-auto p-4 flex justify-center items-center min-h-screen"><p>Loading user profile...</p></div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 flex flex-col justify-center items-center min-h-screen">
        <p className="text-red-500 text-xl mb-4">Error: {error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (!userDetail) {
    return (
      <div className="container mx-auto p-4 flex flex-col justify-center items-center min-h-screen">
        <p className="text-xl mb-4">User profile not found.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <UserProfileDisplay userDetail={userDetail} />
    </div>
  );
} 