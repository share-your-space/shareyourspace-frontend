"use client";

import React, { useEffect, useState } from 'react';
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
import { User } from '@/types/auth';
import type { WorkstationDetail } from '@/types/space';

interface AssignWorkstationModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignableUsers: User[];
  availableWorkstations: WorkstationDetail[];
  onAssign: (userId: string, workstationId: string) => Promise<void>;
  userIdToAssign?: string;
  isAssigning: boolean;
}

const AssignWorkstationModal: React.FC<AssignWorkstationModalProps> = ({
  isOpen,
  onClose,
  assignableUsers,
  availableWorkstations,
  onAssign,
  userIdToAssign,
  isAssigning,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(userIdToAssign);
  const [selectedWorkstationId, setSelectedWorkstationId] = useState<string | undefined>();

  useEffect(() => {
    if (isOpen) {
        setSelectedUserId(userIdToAssign);
        setSelectedWorkstationId(undefined); 
    }
  }, [userIdToAssign, isOpen]);
  
  const handleAssign = () => {
    if (!selectedUserId || !selectedWorkstationId) return;
    onAssign(selectedUserId, selectedWorkstationId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Workstation</DialogTitle>
          <DialogDescription>
            Select a user and an available workstation to assign them to.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="user-select" className="text-right">
              User
            </Label>
            <Select
              onValueChange={setSelectedUserId}
              value={selectedUserId}
              disabled={!!userIdToAssign}
            >
              <SelectTrigger id="user-select" className="col-span-3">
                 <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {assignableUsers.map(u => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name || u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="workstation-select" className="text-right">
              Workstation
            </Label>
            <Select
              onValueChange={setSelectedWorkstationId}
              value={selectedWorkstationId}
            >
              <SelectTrigger id="workstation-select" className="col-span-3">
                 <SelectValue placeholder="Select a workstation" />
              </SelectTrigger>
              <SelectContent>
                {availableWorkstations.map(ws => (
                  <SelectItem key={ws.id} value={ws.id}>
                    {ws.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleAssign} 
            disabled={!selectedUserId || !selectedWorkstationId || isAssigning}
          >
            {isAssigning ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignWorkstationModal;