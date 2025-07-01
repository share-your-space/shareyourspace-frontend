'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { registerCorporateAdmin } from '@/lib/api/auth';
import { toast } from 'sonner';

const corporateAdminSchema = z.object({
  // User Data
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  // Company Data
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  companyWebsite: z.string().url('Invalid website URL'),
  companyDescription: z.string().min(10, 'Description must be at least 10 characters'),
});

type CorporateAdminFormValues = z.infer<typeof corporateAdminSchema>;

export default function CorporateAdminSignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CorporateAdminFormValues>({
    resolver: zodResolver(corporateAdminSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      companyName: '',
      companyWebsite: '',
      companyDescription: '',
    },
  });

  const onSubmit = async (values: CorporateAdminFormValues) => {
    setIsLoading(true);
    const payload = {
      user_data: {
        full_name: values.fullName,
        email: values.email,
        password: values.password,
      },
      company_data: {
        name: values.companyName,
        website: values.companyWebsite,
        description: values.companyDescription,
      },
    };
    try {
      await registerCorporateAdmin(payload);
      toast.success('Registration successful!', {
        description: 'A verification email has been sent to your address. Please verify to continue.',
      });
      router.push('/auth/check-email');
    } catch (error: any) {
      toast.error('Registration Failed', {
        description: error.response?.data?.detail || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Sign Up and Register Your Company</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <h3 className="text-lg font-semibold">Your Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <hr />
              <h3 className="text-lg font-semibold">Company Information</h3>
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome Company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyWebsite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="What does your company do?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Register Company'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 