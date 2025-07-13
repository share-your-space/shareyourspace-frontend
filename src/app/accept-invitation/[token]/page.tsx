"use client";

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserRole } from '@/types/enums';
import { User } from '@/types/auth';

const acceptFormSchema = z.object({
  full_name: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type AcceptFormValues = z.infer<typeof acceptFormSchema>;

// Mock invitation details based on a token
const mockInvitations: { [key: string]: { email: string; organization_name: string; organization_type: string, role: UserRole, company_id: number, company_name: string } } = {
  'valid-token-startup': {
    email: 'new.member@example.com',
    organization_name: 'QuantumLeap AI',
    organization_type: 'Startup',
    role: UserRole.STARTUP_MEMBER,
    company_id: 2,
    company_name: 'QuantumLeap AI'
  },
  'valid-token-company': {
    email: 'new.employee@example.com',
    organization_name: 'Innovate Inc.',
    organization_type: 'Company',
    role: UserRole.CORP_MEMBER,
    company_id: 1,
    company_name: 'Innovate Inc.'
  },
};

function AcceptInvitationContent() {
  const router = useRouter();
  const params = useParams();
  const login = useAuthStore((state) => state.login);
  const [invitationDetails, setInvitationDetails] = useState<{ email: string; organization_name: string; organization_type: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  useEffect(() => {
    if (token) {
      const details = mockInvitations[token];
      if (details) {
        setInvitationDetails(details);
      } else {
        setError('Invalid or expired invitation link.');
      }
    }
  }, [token]);

  const form = useForm<AcceptFormValues>({
    resolver: zodResolver(acceptFormSchema),
    defaultValues: { full_name: '', password: '', confirm_password: '' },
  });

  const onSubmit = async (values: AcceptFormValues) => {
    if (!token) {
      toast.error("Invitation token is missing.");
      return;
    }
    setIsLoading(true);
    const toastId = toast.loading("Accepting invitation...");

    setTimeout(() => {
      const invitation = mockInvitations[token];
      if (!invitation) {
          toast.error('Invalid invitation.', { id: toastId });
          setIsLoading(false);
          return;
      }

      try {
        // Simulate API call
        const newUser: User = {
          id: (Math.floor(Math.random() * 10000) + 100).toString(), // random user id as string
          email: invitation.email,
          name: values.full_name,
          role: invitation.role,
          profile_picture_url: `https://i.pravatar.cc/150?u=${invitation.email}`,
          status: 'ACTIVE',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          company_id: invitation.company_id?.toString(),
          company_name: invitation.company_name,
        };

        // Simulate successful user creation and login
        login('mock-jwt-token-accepted-invite', newUser);
        
        toast.success(`Welcome to ${invitation.organization_name}!`, { id: toastId });
        router.push('/dashboard');
      } catch (err) {
        console.error("Failed to create account:", err);
        setIsLoading(false);
        toast.error('Failed to accept invitation. Please try again.', { id: toastId });
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button onClick={() => router.push('/signup')} className="mt-4 w-full">Sign Up</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!invitationDetails) {
    return <div className="flex items-center justify-center min-h-screen">Loading invitation...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join {invitationDetails.organization_name}</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join {invitationDetails.organization_name}.
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