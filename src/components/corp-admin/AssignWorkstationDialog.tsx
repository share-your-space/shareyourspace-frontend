"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { assignWorkstation } from '@/lib/api/corp-admin';
import { toast } from 'sonner';
import { WorkstationDetail } from '@/types/space';
import { User } from '@/types/auth'; // Assuming a basic User type exists

const assignSchema = z.object({
  userId: z.string().nonempty("Please select a user"),
});

type AssignFormValues = z.infer<typeof assignSchema>;

interface AssignWorkstationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  workstation: WorkstationDetail | null;
  users: User[];
  onAssignmentSuccess: () => void;
  spaceId: string;
}

export const AssignWorkstationDialog = ({ isOpen, onOpenChange, workstation, users, onAssignmentSuccess, spaceId }: AssignWorkstationDialogProps) => {
  const form = useForm<AssignFormValues>({
    resolver: zodResolver(assignSchema),
  });

  const onSubmit = async (values: AssignFormValues) => {
    if (!workstation) return;
    try {
      await assignWorkstation(spaceId, workstation.id, parseInt(values.userId));
      toast.success(`Successfully assigned ${workstation.name}.`);
      onAssignmentSuccess();
    } catch (error) {
      toast.error("Failed to assign workstation.");
      console.error(error);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Workstation: {workstation?.name}</DialogTitle>
          <DialogDescription>Select a user to assign to this workstation.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user to assign" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.full_name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Assigning...' : 'Assign Workstation'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
