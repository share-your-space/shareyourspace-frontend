'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { getCompany, updateMyCompany } from '@/lib/api/organizations';
import { Company, CompanyUpdate } from '@/types/organization';
import { useAuthStore } from '@/store/authStore';
import { TeamSize } from '@/types/enums';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
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
  looking_for: z.array(z.string()).optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

const CompanyProfilePage = () => {
  const params = useParams();
  const { user, refreshCurrentUser } = useAuthStore();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const companyId = Number(params.id);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
  });
  
  const { getValues, reset } = form;

  const fetchCompany = useCallback(async () => {
    if (isNaN(companyId)) { setLoading(false); return; }
    try {
      setLoading(true);
      const data = await getCompany(companyId);
      setCompany(data);
      reset({
        name: data.name,
        industry_focus: data.industry_focus || '',
        description: data.description || '',
        website: data.website || '',
        team_size: data.team_size || undefined,
        looking_for: data.looking_for || [],
      });
    } catch (error) {
      toast.error('Failed to fetch company profile');
    } finally {
      setLoading(false);
    }
  }, [companyId, reset]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const handleSave = async () => {
    const values = form.getValues();
    try {
      await updateMyCompany(values);
      toast.success('Profile updated successfully!');
      
      // Refetch company data to show updated info
      fetchCompany();

      // Also refresh the user's auth context if their own company name changed
      if (user?.company_id === companyId) {
        await refreshCurrentUser();
      }
      setIsEditing(false); // Exit editing mode on successful save
    } catch (error) {
       toast.error('Failed to update profile.');
    }
  };

  const canEdit = user?.role === 'CORP_ADMIN' && user?.company_id === companyId;

  if (loading) {
    return <AuthenticatedLayout><Skeleton className="h-64 w-full" /></AuthenticatedLayout>;
  }

  if (!company) {
    return <AuthenticatedLayout><div>Company not found.</div></AuthenticatedLayout>;
  }

  return (
    <AuthenticatedLayout>
        <div className="container mx-auto p-4 max-w-4xl">
             <div className="flex justify-end mb-4">
                {canEdit && (
                <Button onClick={() => setIsEditing(!isEditing)}>
                    <Edit className="mr-2 h-4 w-4" /> {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
                )}
            </div>
            <CompanyProfileDisplay company={company} isEditing={isEditing} form={form} onSave={handleSave} />
        </div>
    </AuthenticatedLayout>
  );
};

export default CompanyProfilePage; 