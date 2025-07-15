import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Workstation, WorkstationStatus, WorkstationType } from '@/types/workstation';

interface CreateWorkstationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  spaceId: string;
  onCreateSuccess: (newWorkstation: Workstation) => void;
}

export const CreateWorkstationDialog: React.FC<CreateWorkstationDialogProps> = ({
  isOpen,
  onOpenChange,
  spaceId,
  onCreateSuccess,
}) => {
  const [workstationName, setWorkstationName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async () => {
    if (!workstationName.trim()) {
      toast.error('Workstation name cannot be empty.');
      return;
    }
    setIsCreating(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      const newWorkstation: Workstation = {
        id: String(Math.floor(Math.random() * 10000)), // Mock ID
        name: workstationName,
        status: WorkstationStatus.AVAILABLE,
        type: WorkstationType.HOT_DESK,
        space_id: spaceId,
        user_id: null,
        user: null,
      };
      toast.success('Workstation created successfully!');
      onCreateSuccess(newWorkstation);
      onOpenChange(false); // Close dialog on success
    } catch (error) {
      console.error('Failed to create workstation:', error);
      toast.error('Failed to create workstation. Please try again.');
    } finally {
      setIsCreating(false);
      setWorkstationName('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Workstation</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={workstationName}
              onChange={(e) => setWorkstationName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Desk 1, Hot Desk A"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Workstation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};