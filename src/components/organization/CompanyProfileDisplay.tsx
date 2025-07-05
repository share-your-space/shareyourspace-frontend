import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link as LinkIcon, Building, Users, ExternalLink, Calendar, Info } from 'lucide-react';
import { Company } from '@/types/organization';
import Link from 'next/link';
import { EditableSection } from '@/components/corp-admin/space-profile/EditableSection';
import { CompanyHeader } from './CompanyHeader';
import { CompanySidebar } from './CompanySidebar';
import { Separator } from '@/components/ui/separator';
import { Controller } from 'react-hook-form';
import { Textarea, Input } from '@/components/ui'; // Assuming these exist
import { TagInput } from '@/components/ui/TagInput';

interface CompanyProfileDisplayProps {
  company: Company;
  isEditing: boolean;
  form: any; // Simplified for brevity
  onSave: (field: any) => void;
}

const CompanyProfileDisplay = ({ company, isEditing, form, onSave }: CompanyProfileDisplayProps) => {
  return (
    <div className="space-y-8">
      <CompanyHeader company={company} />
      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <EditableSection title="About" isEditing={isEditing} onSave={() => onSave('description')}
            editContent={<Controller name="description" control={form.control} render={({ field }) => <Textarea {...field} rows={6} />} />}
          >
            <p className="prose max-w-none">{company.description}</p>
          </EditableSection>
          
          <EditableSection title="Looking For Talent" isEditing={isEditing} onSave={() => onSave('looking_for')}
            editContent={<Controller name="looking_for" control={form.control} render={({ field }) => <TagInput {...field} placeholder="Add a role..."/>} />}
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