'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companySchema, CompanyFormData } from '@/lib/schemas';
import { Company, Startup } from '@/types/organization';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import CompanyProfileDisplay from '@/components/organization/CompanyProfileDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit } from 'lucide-react';
import { mockOrganizations } from '@/lib/mock-data';

const CompanyProfilePageContent = () => {
  const params = useParams();
  const { user } = useAuthStore();
  const [company, setCompany] = useState<Company | Startup | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const companyId = params.id as string;

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  const { reset, getValues } = form;

  const fetchCompany = useCallback(() => {
    if (!companyId) {
      setError("Invalid company ID.");
      setLoading(false);
      return;
    }
    
    const foundCompany = mockOrganizations.find((c: Company | Startup) => c.id === companyId);

    if (foundCompany) {
      setCompany(foundCompany);
      reset({
        name: foundCompany.name,
        website: foundCompany.website || '',
        industry_focus: foundCompany.industry_focus || [],
        description: foundCompany.description || '',
        looking_for: foundCompany.looking_for || [],
      });
    } else {
      setError("Company not found.");
    }
    setLoading(false);
  }, [companyId, reset]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const handleSave = (field: keyof CompanyFormData) => {
    const value = getValues(field);
    const toastId = toast.loading("Saving changes...");
    
    setTimeout(() => {
      if (company) {
        const updatedCompany = { ...company, [field]: value };
        setCompany(updatedCompany);
        
        const companyIndex = mockOrganizations.findIndex((c: Company | Startup) => c.id === company.id);
        if (companyIndex !== -1) {
          mockOrganizations[companyIndex] = updatedCompany;
        }

        toast.success('Profile updated successfully!', { id: toastId });
        setIsEditing(false); 
      } else {
        toast.error('Failed to update profile.', { id: toastId });
      }
    }, 1000);
  };

  const canEdit = (user?.role === 'CORP_ADMIN' || user?.role === 'STARTUP_ADMIN') && user?.company_id === companyId;

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return <div className="text-center py-10">{error}</div>;
  }

  if (!company) {
    return <div>Company not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{company.name}</h1>
        {canEdit && (
          <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        )}
      </div>
      <CompanyProfileDisplay company={company} isEditing={isEditing} form={form} onSave={handleSave} />
    </div>
  );
};

const CompanyProfilePage = () => (
  <Suspense fallback={<Skeleton className="h-screen w-full" />}>
    <CompanyProfilePageContent />
  </Suspense>
);

export default CompanyProfilePage;