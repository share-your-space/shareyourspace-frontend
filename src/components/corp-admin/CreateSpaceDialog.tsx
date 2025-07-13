"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Space } from '@/types/space';
import { useAuthStore } from '@/store/authStore';

const spaceSchema = z.object({
  name: z.string().min(3, 'Space name must be at least 3 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  total_workstations: z.coerce.number().int().positive('Must be a positive number'),
});

type SpaceFormValues = z.infer<typeof spaceSchema>;

interface CreateSpaceDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSpaceCreated: (newSpace: Space) => void;
  title?: string;
}

export const CreateSpaceDialog = ({
  isOpen,
  onOpenChange,
  onSpaceCreated,
  title = 'Create a New Space',
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
    if (!user || !user.company_id) {
      toast.error('You must be logged in to create a space.');
      return;
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const newSpace: Space = {
        id: Math.floor(Math.random() * 10000),
        name: values.name,
        address: values.address,
        company_id: user.company_id,
        total_workstations: values.total_workstations,
        available_workstations: values.total_workstations,
        status: 'active',
        image_url: `https://source.unsplash.com/random/400x300?workspace&sig=${Math.random()}`,
        workstations: [],
      };

      toast.success('Space created successfully!');
      onSpaceCreated(newSpace);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast.error('Failed to create space', {
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
            Let us set up a workspace for your company. You can add more details
            later.
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
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Creating...' : 'Create Space'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};