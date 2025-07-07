'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { CompleteProfileDialog } from '@/components/ui/CompleteProfileDialog';
import { usePathname } from 'next/navigation';
import AuthGuard from './AuthGuard';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const { user } = useAuthStore();
  const [isProfileDialogOpen, setProfileDialogOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('hasSeenProfilePopup');
    
    if (user && !hasSeenPopup && pathname !== '/dashboard/profile/edit') {
      const profile = user.profile;
      const isProfileConsideredEmpty = !profile || (
        !profile.bio &&
        !profile.title &&
        !profile.project_interests_goals &&
        (!profile.skills_expertise || profile.skills_expertise.length === 0) &&
        (!profile.industry_focus || profile.industry_focus.length === 0) &&
        (!profile.collaboration_preferences || profile.collaboration_preferences.length === 0) &&
        (!profile.tools_technologies || profile.tools_technologies.length === 0)
      );

      if (isProfileConsideredEmpty) {
        const timer = setTimeout(() => {
          setProfileDialogOpen(true);
          sessionStorage.setItem('hasSeenProfilePopup', 'true');
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, pathname]);

  return (
    <AuthGuard>
      {children}
      <CompleteProfileDialog
        isOpen={isProfileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
      />
    </AuthGuard>
  );
};

export default AuthenticatedLayout;