"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { updateWorkstationStatus } from '@/lib/api/corp-admin';
import { toast } from 'sonner';
import { WorkstationDetail } from '@/types/space';
import { WorkstationStatus } from '@/types/enums'; // Assuming this enum exists

const statusSchema = z.object({
  status: z.nativeEnum(WorkstationStatus),
});

type StatusFormValues = z.infer<typeof statusSchema>;

interface ChangeWorkstationStatusDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  workstation: WorkstationDetail | null;
  onStatusChangeSuccess: () => void;
  spaceId: string;
}

export const ChangeWorkstationStatusDialog = ({ isOpen, onOpenChange, workstation, onStatusChangeSuccess, spaceId }: ChangeWorkstationStatusDialogProps) => {
  const form = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      status: workstation?.status as WorkstationStatus | undefined,
    }
  });

  const onSubmit = async (values: StatusFormValues) => {
    if (!workstation) return;
    try {
      await updateWorkstationStatus(spaceId, workstation.id, values.status);
      toast.success(`Successfully updated status for ${workstation.name}.`);
      onStatusChangeSuccess();
    } catch (error) {
      toast.error("Failed to update status.");
      console.error(error);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Status: {workstation?.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a new status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(WorkstationStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Status'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
