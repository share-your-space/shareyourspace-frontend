'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { getCompany, updateMyCompany } from '@/lib/api/organizations';
import { Company, CompanyUpdate } from '@/types/organization';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import CompanyProfileDisplay from '@/components/organization/CompanyProfileDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit } from 'lucide-react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  website: z.string().url({ message: "Invalid URL" }).optional().or(z.literal('')),
  industry_focus: z.array(z.string()).optional(),
  description: z.string().optional(),
  looking_for: z.array(z.string()).optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

const CompanyProfilePage = () => {
  const params = useParams();
  const { user, refreshCurrentUser } = useAuthStore();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const companyId = Number(params.id);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
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
        website: data.website || '',
        industry_focus: data.industry_focus || [],
        description: data.description || '',
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

  const handleSave = async (field: keyof CompanyFormData) => {
    try {
      const value = getValues(field);
      const updatedCompany = await updateMyCompany({ [field]: value });
      setCompany(updatedCompany);
      toast.success('Profile updated!');
      
      // Refetch company data to show updated info
      fetchCompany();

      // Also refresh the user's auth context if their own company name changed
      if (user?.company_id === companyId) {
        await refreshCurrentUser();
      }

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