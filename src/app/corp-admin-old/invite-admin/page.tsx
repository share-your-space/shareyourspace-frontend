"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { inviteAdmin } from '@/lib/api/corp-admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

const InviteAdminPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
  });

  const onSubmit = async (data: InviteFormValues) => {
    try {
      await inviteAdmin(data.email);
      toast.success(`Invitation sent to ${data.email}`);
      reset();
    } catch (error) {
      toast.error("Failed to send invitation.");
      console.error(error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Invite New Admin</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Enter the email address of the person you want to invite to become a corporate administrator for your company.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex items-center space-x-2">
        <div className="flex-grow">
          <Input
            {...register("email")}
            placeholder="colleague@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Invite'}
        </Button>
      </form>
    </div>
  );
};

export default InviteAdminPage;
