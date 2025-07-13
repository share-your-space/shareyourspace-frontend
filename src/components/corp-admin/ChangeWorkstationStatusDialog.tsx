"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { toast } from 'sonner';
import { Workstation } from '@/types/workstation';

const WORKSTATION_STATUSES = ['Available', 'Occupied', 'Under Maintenance'] as const;

const statusSchema = z.object({
  status: z.enum(WORKSTATION_STATUSES),
});

type StatusFormValues = z.infer<typeof statusSchema>;

interface ChangeWorkstationStatusDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  workstation: Workstation | null;
  onStatusChangeSuccess: (updatedWorkstation: Workstation) => void;
}

export const ChangeWorkstationStatusDialog = ({
  isOpen,
  onOpenChange,
  workstation,
  onStatusChangeSuccess,
}: ChangeWorkstationStatusDialogProps) => {
  const form = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
  });

  useEffect(() => {
    if (workstation) {
      form.setValue('status', workstation.status as typeof WORKSTATION_STATUSES[number]);
    }
  }, [workstation, form]);


  const onSubmit = async (values: StatusFormValues) => {
    if (!workstation) return;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const updatedWorkstation: Workstation = {
        ...workstation,
        status: values.status,
        // If status is 'Available', unassign the user
        ...(values.status === 'Available' && { user: null, user_id: null }),
      };

      toast.success(`Successfully updated status for ${workstation.name}.`);
      onStatusChangeSuccess(updatedWorkstation);
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update status.');
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a new status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {WORKSTATION_STATUSES.map((status) => (
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
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Saving...' : 'Save Status'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
