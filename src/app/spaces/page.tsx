'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SpacesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/browse-spaces');
  }, [router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-lg">Redirecting to browse spaces...</p>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">Please wait a moment.</p>
    </div>
  );
}
