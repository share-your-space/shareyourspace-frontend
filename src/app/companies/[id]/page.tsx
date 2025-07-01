'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { getCompany, updateMyCompany } from '@/lib/api/organizations';
import { Company, CompanyUpdate } from '@/types/organization';
import { useAuthStore } from '@/store/authStore';
import { TeamSize } from '@/types/enums';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import CompanyProfileDisplay from '@/components/organization/CompanyProfileDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Edit, Save, X } from 'lucide-react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';


const companyFormSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry_focus: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  team_size: z.nativeEnum(TeamSize).optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

const CompanyProfilePage = () => {
  const params = useParams();
  const { user, updateUser } = useAuthStore();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const companyId = Number(params.id);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {},
  });

  const fetchCompany = useCallback(async () => {
    if (isNaN(companyId)) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getCompany(companyId);
      setCompany(data);
      form.reset({
        name: data.name,
        industry_focus: data.industry_focus || '',
        description: data.description || '',
        website: data.website || '',
        team_size: data.team_size || undefined,
      });
    } catch (error) {
      toast.error('Failed to fetch company profile');
      console.error('Failed to fetch company profile', error);
    } finally {
      setLoading(false);
    }
  }, [companyId, form]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const onSubmit = async (data: CompanyFormValues) => {
    const promise = updateMyCompany(data).then((updatedCompany) => {
      setCompany(updatedCompany);
      setIsEditing(false);
       // Also update user in store if their own company name changes
      if (user?.company_id === updatedCompany.id && user.company?.name !== updatedCompany.name) {
          const updatedUser = { ...user, company: { ...user.company, name: updatedCompany.name }};
          updateUser(updatedUser);
      }
    });

    toast.promise(promise, {
      loading: 'Updating profile...',
      success: 'Profile updated successfully!',
      error: 'Failed to update company profile.',
    });
  };

  const canEdit = user?.role === 'CORP_ADMIN' && user?.company_id === companyId;

  if (loading) {
    return (
        <AuthenticatedLayout>
            <div className="container mx-auto p-4">
                <Skeleton className="h-48 w-full mb-6" />
                <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-6 w-full" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
  }

  if (!company) {
    return <AuthenticatedLayout><div className="text-center py-10">Company not found.</div></AuthenticatedLayout>;
  }

  return (
    <AuthenticatedLayout>
        <div className="container mx-auto p-4 max-w-4xl">
            {isEditing && canEdit ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Company Profile</CardTitle>
                        <CardDescription>Update your company's public information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="industry_focus" render={({ field }) => (
                            <FormItem><FormLabel>Industry Focus</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="website" render={({ field }) => (
                            <FormItem><FormLabel>Website</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="team_size" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Team Size</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select team size" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {Object.values(TeamSize).map((size) => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                                    </SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )} />
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={form.formState.isSubmitting}>
                                <X className="mr-2 h-4 w-4" /> Cancel
                            </Button>
                            <Button type="submit" disabled={!form.formState.isDirty || form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </div>
                        </form>
                    </Form>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="flex justify-end mb-4">
                        {canEdit && (
                        <Button onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Profile
                        </Button>
                        )}
                    </div>
                    <CompanyProfileDisplay company={company} />
                </>
            )}
        </div>
    </AuthenticatedLayout>
  );
};

export default CompanyProfilePage; 