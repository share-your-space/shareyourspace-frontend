"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { createSpaceForCompany } from '@/lib/api/corp-admin';
import { toast } from 'sonner';
import { SpaceCreate, BasicSpace, Space } from '@/types/space';
import { useAuthStore } from '@/store/authStore';

const spaceSchema = z.object({
  name: z.string().min(3, 'Space name must be at least 3 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  total_workstations: z.number().int().positive('Must be a positive number'),
});

type SpaceFormValues = z.infer<typeof spaceSchema>;

interface CreateSpaceDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSpaceCreated: (newSpace: BasicSpace) => void;
  title?: string;
}

export const CreateSpaceDialog = ({ 
  isOpen, 
  onOpenChange, 
  onSpaceCreated, 
  title = "Create a New Space" 
}: CreateSpaceDialogProps) => {
  const user = useAuthStore((state) => state.user);
  const form = useForm<SpaceFormValues>({
    resolver: zodResolver(spaceSchema),
    defaultValues: {
      name: '',
      address: '',
      total_workstations: 10,
    },
  });

  const onSubmit = async (values: SpaceFormValues) => {
    if (!user) {
      toast.error("You must be logged in to create a space.");
      return;
    }

    try {
      const spaceData: SpaceCreate = {
        name: values.name,
        address: values.address,
        total_workstations: values.total_workstations,
      };

      const newSpace: Space = await createSpaceForCompany(spaceData);
      toast.success('Space created successfully!');
      onSpaceCreated(newSpace);
      form.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast.error("Failed to create space", {
        description: errorMessage,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Let us set up a workspace for your company. You can add more details later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Space Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Downtown Hub" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location / Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, Anytown" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="total_workstations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Number of Workstations</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creating...' : 'Create Space'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 