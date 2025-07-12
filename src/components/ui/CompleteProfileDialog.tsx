'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface CompleteProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompleteProfileDialog: React.FC<CompleteProfileDialogProps> = ({ isOpen, onClose }) => {
  const router = useRouter();

  const handleCompleteProfile = () => {
    router.push('/dashboard/settings/profile');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Help others get to know you better by adding more details to your profile. A complete profile increases your chances of connecting with the right people.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-between gap-2">
          <Button variant="ghost" onClick={onClose}>
            Skip for Now
          </Button>
          <Button onClick={handleCompleteProfile}>
            Complete Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};