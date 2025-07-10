'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companySchema, CompanyFormData } from '@/lib/schemas';

import { getCompany, updateMyCompany } from '@/lib/api/organizations';
import { Company } from '@/types/organization';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import CompanyProfileDisplay from '@/components/organization/CompanyProfileDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit } from 'lucide-react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

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

      const parseStringToArray = (value: string | string[] | null | undefined): string[] => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean);
        return [];
      };

      reset({
        name: data.name,
        website: data.website || '',
        industry_focus: parseStringToArray(data.industry_focus),
        description: data.description || '',
        looking_for: parseStringToArray(data.looking_for),
      });
    } catch (e) {
      const error = e as Error;
      toast.error(`Failed to fetch company profile: ${error.message}`);
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
      console.log('--- Saving Company Profile ---');
      console.log(`Field: ${field}`);
      console.log('Value being sent to backend:', value);

      const payload = { [field]: value };
      const updatedCompany = await updateMyCompany(payload);
      
      console.log('Response from backend (updated company):', updatedCompany);

      setCompany(updatedCompany);
      toast.success('Profile updated!');
      
      // The fetchCompany() call here might be causing a race condition
      // where we fetch the data before the update has fully propagated in the backend db.
      // The updateMyCompany should return the updated data, so we can rely on that for the UI update.
      // A user page refresh will be the ultimate test of persistence.
      // fetchCompany();

      // Also refresh the user's auth context if their own company name changed
      if (user?.company_id === companyId) {
        await refreshCurrentUser();
      }

    } catch (e) {
      const error = e as Error;
      console.error('--- Error Saving Company Profile ---');
      console.error(`Failed to update field: ${field}`);
      console.error(error);
      toast.error(`Failed to update profile: ${error.message}`);
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