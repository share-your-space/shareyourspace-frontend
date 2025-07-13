'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companySchema, CompanyFormData } from '@/lib/schemas';
import { Company } from '@/types/company';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import CompanyProfileDisplay from '@/components/organization/CompanyProfileDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit } from 'lucide-react';
import { mockCompanies, mockStartups } from '@/lib/mock-data';

const allCompanies = [...mockCompanies, ...mockStartups];

const CompanyProfilePageContent = () => {
  const params = useParams();
  const { user } = useAuthStore();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const companyId = params.id as string;

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  const { reset } = form;

  const fetchCompany = useCallback(() => {
    if (!companyId) {
      setError("Invalid company ID.");
      setLoading(false);
      return;
    }
    
    const foundCompany = allCompanies.find(c => c.id === companyId);

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

  const handleSave = (field: keyof CompanyFormData, value: string | string[]) => {
    const toastId = toast.loading("Saving changes...");
    
    setTimeout(() => {
      if (company) {
        const updatedCompany = { ...company, [field]: value };
        setCompany(updatedCompany);
        
        // Note: This only updates the local state for the demo.
        const companyIndex = allCompanies.findIndex(c => c.id === company.id);
        if (companyIndex !== -1) {
          allCompanies[companyIndex] = updatedCompany;
        }

        toast.success('Profile updated successfully!', { id: toastId });
        setIsEditing(false); // Exit editing mode for the specific field
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
      <div className="flex justify-end mb-4">
        {canEdit && (
          <Button onClick={() => setIsEditing(!isEditing)}>
            <Edit className="mr-2 h-4 w-4" /> {isEditing ? 'Cancel' : 'Edit Profile'}
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