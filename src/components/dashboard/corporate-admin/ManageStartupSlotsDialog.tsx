'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { StartupTenantInfo } from '@/types/space';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ManageStartupSlotsDialogProps {
  startups: StartupTenantInfo[];
  onSlotsUpdated: () => void;
}

export default function ManageStartupSlotsDialog({ startups, onSlotsUpdated }: ManageStartupSlotsDialogProps) {
  const [slotValues, setSlotValues] = useState<Record<string, number>>({});

  useEffect(() => {
    const initialSlots = startups.reduce((acc, s) => {
      acc[s.details.id] = s.details.member_slots_allocated || 0;
      return acc;
    }, {} as Record<string, number>);
    setSlotValues(initialSlots);
  }, [startups]);

  const handleSlotChange = (startupId: number, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setSlotValues(prev => ({ ...prev, [startupId]: numValue }));
    }
  };

  const handleUpdateSlots = async (startupId: number) => {
    const newSlots = slotValues[startupId];
    try {
      await api.put(`/admin/startups/${startupId}/slots`, { member_slots_allocated: newSlots });
      toast.success('Member slots updated successfully!');
      onSlotsUpdated();
    } catch (error: any) {
      toast.error('Failed to update slots', {
        description: error.response?.data?.detail || 'An unexpected error occurred.',
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Manage Startup Slots</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Member Slots</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Startup</TableHead>
              <TableHead>Slots Used</TableHead>
              <TableHead>Slots Allocated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {startups.map(s => (
              <TableRow key={s.details.id}>
                <TableCell>{s.details.name}</TableCell>
                <TableCell>{s.details.member_slots_used} / {s.details.member_slots_allocated}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={slotValues[s.details.id] || 0}
                    onChange={(e) => handleSlotChange(s.details.id, e.target.value)}
                    className="w-24"
                  />
                </TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => handleUpdateSlots(s.details.id)}>Update</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
} 