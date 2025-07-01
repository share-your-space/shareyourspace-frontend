"use client";

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { acceptInvitation, getInvitationDetails } from '@/lib/api/invitations';
import { UserCreateAcceptInvitation, InvitationDeclineRequest, InvitationStatus } from '@/types/auth';
import { useAuthStore } from '@/store/authStore';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/api';

const acceptFormSchema = z.object({
  full_name: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

const declineFormSchema = z.object({
  reason: z.string().optional(),
});

type AcceptFormValues = z.infer<typeof acceptFormSchema>;
type DeclineFormValues = z.infer<typeof declineFormSchema>;

function AcceptInvitationContent() {
  const router = useRouter();
  const params = useParams();
  const { loginWithNewToken } = useAuthStore();
  const [invitationDetails, setInvitationDetails] = useState<{ email: string; organization_name: string; organization_type: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  useEffect(() => {
    if (token) {
      getInvitationDetails(token)
        .then(response => {
          setInvitationDetails(response);
        })
        .catch(err => {
          setError(err.response?.data?.detail || 'Invalid or expired invitation link.');
        });
    }
  }, [token]);

  const form = useForm<AcceptFormValues>({
    resolver: zodResolver(acceptFormSchema),
    defaultValues: { full_name: '', password: '', confirm_password: '' },
  });

  const onSubmit = async (values: AcceptFormValues) => {
    setIsLoading(true);
    try {
      const response = await acceptInvitation(token, {
        full_name: values.full_name,
        password: values.password,
      });
      const { access_token, user } = response;
      loginWithNewToken(access_token);
      toast.success(`Welcome to ${invitationDetails?.organization_name}!`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error('Failed to accept invitation', {
        description: err.response?.data?.detail || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
  }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Invitation Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!invitationDetails) {
    return <div className="flex items-center justify-center min-h-screen">Loading invitation...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join {invitationDetails.organization_name}</CardTitle>
          <CardDescription>
            You have been invited to join {invitationDetails.organization_name} on ShareYourSpace.
            Please create an account to accept.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
                control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                    <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Joining...' : 'Accept Invitation'}
              </Button>
                </form>
              </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AcceptInvitationContent />
    </Suspense>
  );
} 