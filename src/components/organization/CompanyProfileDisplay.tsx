import React from 'react';
import { Company, Startup } from '@/types/organization';
import { CompanyHeader } from './CompanyHeader';
import { CompanySidebar } from './CompanySidebar';
import { Separator } from '@/components/ui/separator';
import { Controller } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { industryOptions, lookingForOptions } from '@/lib/options';
import { EditableSection } from '@/components/corp-admin/space-profile/EditableSection';
import { UseFormReturn } from 'react-hook-form';
import { CompanyFormData } from '@/lib/schemas';

interface CompanyProfileDisplayProps {
  company: Company | Startup;
  isEditing: boolean;
  form: UseFormReturn<CompanyFormData>;
  onSave: (field: keyof CompanyFormData) => void;
}

const CompanyProfileDisplay = ({ company, isEditing, form, onSave }: CompanyProfileDisplayProps) => {
  return (
    <div className="space-y-8">
      <CompanyHeader company={company} />
      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <EditableSection title="About" isEditing={isEditing} onSave={() => onSave('description')}
            editContent={<Controller name="description" control={form.control} render={({ field }) => <Textarea {...field} value={field.value || ''} rows={6} />} />}
          >
            <p className="prose max-w-none">{company.description}</p>
          </EditableSection>

          <EditableSection title="Industry Focus" isEditing={isEditing} onSave={() => onSave('industry_focus')}
            editContent={<Controller name="industry_focus" control={form.control} render={({ field }) => <MultiSelect selected={field.value || []} onChange={field.onChange} options={industryOptions} placeholder="Add an industry..."/>} />}
          >
             <div className="flex flex-wrap gap-2">
                {company.industry_focus?.map(industry => <div key={industry} className="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 text-sm font-medium">{industry}</div>)}
            </div>
          </EditableSection>
          
          <EditableSection title="Looking For Talent" isEditing={isEditing} onSave={() => onSave('looking_for')}
            editContent={<Controller name="looking_for" control={form.control} render={({ field }) => <MultiSelect selected={field.value || []} onChange={field.onChange} options={lookingForOptions} placeholder="Add a role..."/>} />}
          >
             <div className="flex flex-wrap gap-2">
                {company.looking_for?.map(role => <div key={role} className="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 text-sm font-medium">{role}</div>)}
            </div>
          </EditableSection>

        </div>
        <div className="md:col-span-1">
          <CompanySidebar company={company} />
        </div>
      </div>
    </div>
  );
};

export default CompanyProfileDisplay;