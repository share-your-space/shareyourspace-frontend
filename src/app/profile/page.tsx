'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

export default function ProfileRedirectPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      router.replace(`/users/${user.id}`);
    } else {
      // If not authenticated or no user ID, redirect to a safe page.
      // In a real app, this might be the login page.
      router.replace('/discover');
    }
  }, [user, isAuthenticated, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-lg">Redirecting to your profile...</p>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">Please wait a moment.</p>
    </div>
  );
}
