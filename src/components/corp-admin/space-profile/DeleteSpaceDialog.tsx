"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DeleteSpaceDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  spaceName: string;
  isPending: boolean;
}

export const DeleteSpaceDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  spaceName,
  isPending,
}: DeleteSpaceDialogProps) => {
  const [confirmationText, setConfirmationText] = useState('');

  const isMatch = confirmationText === spaceName;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive">Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the <strong>{spaceName}</strong> space and move all its tenants to the waitlist.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="confirmation">
            Please type <span className="font-bold text-primary">{spaceName}</span> to confirm.
          </Label>
          <Input
            id="confirmation"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            className="mt-2"
            autoComplete="off"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={!isMatch || isPending}
          >
            {isPending ? "Deleting..." : "I understand, delete this space"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 