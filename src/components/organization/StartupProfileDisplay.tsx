import React from 'react';
import { Startup } from '@/types/organization';
import { EditableSection } from '@/components/corp-admin/space-profile/EditableSection';
import { CompanyHeader } from './CompanyHeader';
import { CompanySidebar } from './CompanySidebar';
import { Separator } from '@/components/ui/separator';
import { Controller } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ExternalLink, Zap } from 'lucide-react';

interface StartupProfileDisplayProps {
  startup: Startup;
  isEditing: boolean;
  form: any;
  onSave: (field: any) => void;
}

const StartupProfileDisplay = ({ startup, isEditing, form, onSave }: StartupProfileDisplayProps) => {
  return (
    <div className="space-y-8">
      <CompanyHeader company={startup} />
      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <EditableSection title="Our Mission" isEditing={isEditing} onSave={() => onSave('mission')}
            editContent={<Controller name="mission" control={form.control} render={({ field }) => <Textarea {...field} rows={4} />} />}
          >
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />
              <p className="prose max-w-none">{startup.mission}</p>
            </div>
          </EditableSection>
          
          <EditableSection title="About Us" isEditing={isEditing} onSave={() => onSave('description')}
            editContent={<Controller name="description" control={form.control} render={({ field }) => <Textarea {...field} rows={6} />} />}
          >
            <p className="prose max-w-none">{startup.description}</p>
          </EditableSection>

          <EditableSection title="Pitch Deck" isEditing={isEditing} onSave={() => onSave('pitch_deck_url')}
            editContent={<Controller name="pitch_deck_url" control={form.control} render={({ field }) => <Input {...field} placeholder="https://link-to-your-deck.com" />} />}
          >
            <a href={startup.pitch_deck_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline">
                <ExternalLink className="h-4 w-4" />
                View Pitch Deck
            </a>
          </EditableSection>

        </div>
        <div className="md:col-span-1">
          <CompanySidebar company={startup} />
        </div>
      </div>
    </div>
  );
};

export default StartupProfileDisplay; 