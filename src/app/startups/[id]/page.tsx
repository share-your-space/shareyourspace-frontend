"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Startup } from '@/types/organization';
import { useAuthStore } from '@/store/authStore';
import { mockStartups } from '@/lib/mock-data';
import { toast } from 'sonner';
import StartupProfileDisplay from '@/components/organization/StartupProfileDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';

type EditableField = 'description' | 'mission' | 'looking_for' | 'industry_focus' | 'pitch_deck_url';

const StartupProfilePage = () => {
  const params = useParams();
  const startupId = params.id as string;
  const { user } = useAuthStore();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm();

  useEffect(() => {
    const foundStartup = mockStartups.find(s => s.id === startupId);
    setStartup(foundStartup || null);
    if (foundStartup) {
      form.reset(foundStartup);
    }
    setLoading(false);
  }, [startupId, form]);

  const handleSave = (field: EditableField) => {
    if (!startup) return;
    
    const value = form.getValues(field);

    const promise = () => new Promise((resolve) => setTimeout(() => {
        setStartup(prev => prev ? { ...prev, [field]: value } : null);
        resolve({ name: startup.name });
    }, 1000));

    toast.promise(promise, {
        loading: 'Updating profile...',
        success: () => {
            setIsEditing(false);
            return 'Profile updated successfully!';
        },
        error: 'Failed to update profile.'
    });
  };

  const canEdit = user?.role === 'STARTUP_ADMIN' && user?.company_id === startupId;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-full max-w-4xl p-4">
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!startup) {
    return <div>Startup not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {canEdit && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      )}
      <StartupProfileDisplay
        startup={startup}
        isEditing={isEditing}
        form={form}
        onSave={handleSave}
      />
    </div>
  );
};

export default StartupProfilePage;