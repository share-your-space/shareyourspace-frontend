import React, { useState, useEffect } from 'react';
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
import { WorkstationDetail } from '@/types/space';
import { updateWorkstationDetails } from '@/lib/api/corp-admin';

interface EditWorkstationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  workstation: WorkstationDetail | null;
  spaceId: string;
  onEditSuccess: () => void;
}

export const EditWorkstationDialog: React.FC<EditWorkstationDialogProps> = ({
  isOpen,
  onOpenChange,
  workstation,
  spaceId,
  onEditSuccess,
}) => {
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (workstation) {
      setName(workstation.name);
    }
  }, [workstation]);

  const handleSubmit = async () => {
    if (!workstation) return;
    if (!name.trim()) {
      toast.error('Workstation name cannot be empty.');
      return;
    }
    setIsSaving(true);
    try {
      await updateWorkstationDetails(spaceId, workstation.id, { name });
      toast.success('Workstation updated successfully!');
      onEditSuccess();
    } catch (error) {
      console.error('Failed to update workstation:', error);
      toast.error('Failed to update workstation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Workstation</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 