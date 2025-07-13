"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Space } from '@/types/space';
import { toast } from 'sonner';
import { mockSpaces } from '@/lib/mock-data'; 

interface AddTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (spaceId: number) => void;
  tenantName: string;
  hasExpressedInterest: boolean;
}

export const AddTenantDialog = ({
  isOpen,
  onClose,
  onConfirm,
  tenantName,
  hasExpressedInterest,
}: AddTenantDialogProps) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Simulate fetching spaces
      setIsLoading(true);
      setTimeout(() => {
        setSpaces(mockSpaces);
        if (mockSpaces.length > 0) {
          setSelectedSpaceId(mockSpaces[0].id.toString());
        }
        setIsLoading(false);
      }, 500);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (selectedSpaceId) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        onConfirm(parseInt(selectedSpaceId, 10));
        toast.success(
          hasExpressedInterest
            ? `${tenantName} added to space.`
            : `Invitation sent to ${tenantName}.`
        );
        setIsLoading(false);
        onClose();
      }, 1000);
    } else {
      toast.warning('Please select a space.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {hasExpressedInterest ? 'Add' : 'Invite'} {tenantName} to a Space
          </DialogTitle>
          <DialogDescription>
            {hasExpressedInterest
              ? `This tenant has expressed interest in one of your spaces. Select a space to add them to directly.`
              : `Select one of your managed spaces to invite this tenant to. They will need to accept the invitation before joining.`}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select
            value={selectedSpaceId}
            onValueChange={setSelectedSpaceId}
            disabled={spaces.length === 0 || isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading spaces..." : "Select a space"} />
            </SelectTrigger>
            <SelectContent>
              {spaces.map((space) => (
                <SelectItem key={space.id} value={space.id.toString()}>
                  {space.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedSpaceId || isLoading}
          >
            {isLoading
              ? hasExpressedInterest ? 'Adding...' : 'Sending Invitation...'
              : hasExpressedInterest ? 'Add to Space' : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};