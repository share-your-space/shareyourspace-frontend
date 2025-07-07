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
import { getCompanySpaces } from '@/lib/api/corp-admin';
import { toast } from 'sonner';

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
      const fetchSpaces = async () => {
        try {
          const companySpaces = await getCompanySpaces();
          setSpaces(companySpaces);
          if (companySpaces.length > 0) {
            setSelectedSpaceId(companySpaces[0].id.toString());
          }
        } catch (error) {
          toast.error('Failed to fetch your spaces.');
          console.error(error);
        }
      };
      fetchSpaces();
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (selectedSpaceId) {
      setIsLoading(true);
      onConfirm(parseInt(selectedSpaceId, 10));
      // The parent component will be responsible for closing the dialog
      // and handling the final loading state.
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
            disabled={spaces.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a space" />
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