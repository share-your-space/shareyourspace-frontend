"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WorkstationDetail, WorkstationStatus as WorkstationStatusType } from '@/types/space';

interface ChangeWorkstationStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  workstation: WorkstationDetail;
  currentStatus: WorkstationStatusType;
  onStatusChange: (newStatus: WorkstationStatusType) => void;
  onSubmit: () => Promise<void>;
  error: string | null;
}

const AVAILABLE_STATUSES_FOR_CHANGE: WorkstationStatusType[] = ['AVAILABLE', 'MAINTENANCE', 'RESERVED']; // Define which statuses can be set manually

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'OCCUPIED': return 'destructive';
      case 'MAINTENANCE': return 'secondary';
      case 'RESERVED': return 'warning';
      default: return 'outline';
    }
  };

const ChangeWorkstationStatusModal: React.FC<ChangeWorkstationStatusModalProps> = ({
  isOpen,
  onClose,
  workstation,
  currentStatus,
  onStatusChange,
  onSubmit,
  error,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Status for: {workstation.name}</DialogTitle>
          <DialogDescription>
            Current Status: <Badge variant={getStatusBadgeVariant(workstation.status)}>{workstation.status}</Badge><br/>
            Select a new status. 
            {workstation.status === 'OCCUPIED' && AVAILABLE_STATUSES_FOR_CHANGE.includes(currentStatus) && 
              'Changing status from OCCUPIED will unassign the current user.'
            }
             Note: 'OCCUPIED' status is managed by user assignment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status-select" className="text-right">New Status</Label>
            <Select 
              onValueChange={(value) => onStatusChange(value as WorkstationStatusType)} 
              value={currentStatus} // Controlled by the page state
            >
              <SelectTrigger id="status-select" className="col-span-3">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_STATUSES_FOR_CHANGE.map(status => (
                  <SelectItem 
                    key={status} 
                    value={status} 
                    // Prevent changing to OCCUPIED directly, or from OCCUPIED to itself via this modal if OCCUPIED is not in AVAILABLE_STATUSES_FOR_CHANGE
                    disabled={status === 'OCCUPIED' || (workstation.status === 'OCCUPIED' && status === workstation.status)}
                  >
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && (<p className="col-span-4 text-sm text-red-500 text-center">{error}</p>)}
        </div>
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="outline" onClick={onClose}>Cancel</Button></DialogClose>
          <Button 
            type="button" 
            onClick={onSubmit} 
            disabled={!currentStatus || currentStatus === workstation.status}
          >
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeWorkstationStatusModal; 