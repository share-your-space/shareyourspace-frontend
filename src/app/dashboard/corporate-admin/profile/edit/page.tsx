'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getCompany, updateMyCompany } from '@/lib/api/organizations';
import { CompanyUpdate } from '@/types/organization';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { TeamSize } from '@/types/enums';
import { toast } from 'sonner';

const companyFormSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry_focus: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  team_size: z.nativeEnum(TeamSize).optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

const EditCompanyProfilePage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (user?.company_id) {
      const fetchCompany = async () => {
        try {
          setLoading(true);
          const data = await getCompany(user.company_id);
          form.reset({
            name: data.name,
            industry_focus: data.industry_focus || '',
            description: data.description || '',
            website: data.website || '',
            team_size: data.team_size || undefined,
          });
        } catch (error) {
          toast.error('Failed to fetch company data.');
        } finally {
          setLoading(false);
        }
      };
      fetchCompany();
    }
  }, [user, form]);

  const onSubmit = async (data: CompanyFormValues) => {
    toast.promise(updateMyCompany(data), {
      loading: 'Updating profile...',
      success: () => {
        router.push(`/companies/${user?.company_id}`);
        return 'Profile updated successfully!';
      },
      error: 'Failed to update company profile.',
    });
  };
  
  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Company Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="industry_focus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry Focus</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="team_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select team size" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {Object.values(TeamSize).map((size) => (
                                <SelectItem key={size} value={size}>{size}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={!form.formState.isDirty || form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditCompanyProfilePage;