'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Startup } from '@/types/organization';
import { useAuthStore } from '@/store/authStore';
import { TeamSize } from '@/types/enums';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import StartupProfileDisplay from '@/components/organization/StartupProfileDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit } from 'lucide-react';
import { mockStartups } from '@/lib/mock-data';

const startupSchema = z.object({
  name: z.string().min(1, 'Startup name is required'),
  website: z.string().url({ message: "Invalid URL" }).optional().or(z.literal('')),
  pitch_deck_url: z.string().url({ message: "Invalid URL" }).optional().or(z.literal('')),
  industry_focus: z.array(z.string()).optional(),
  looking_for: z.array(z.string()).optional(),
  team_size: z.nativeEnum(TeamSize).optional(),
  mission: z.string().optional(),
  description: z.string().optional(),
});

type StartupFormData = z.infer<typeof startupSchema>;

const StartupProfilePage = () => {
  const params = useParams();
  const { user } = useAuthStore();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const startupId = Number(params.id);

  const form = useForm<StartupFormData>({
    resolver: zodResolver(startupSchema),
  });

  const { getValues, reset } = form;

  const fetchStartup = useCallback(async () => {
    if (isNaN(startupId)) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = mockStartups.find(s => s.id === startupId) as Startup | undefined;

      if (data) {
        setStartup(data);

        const parseStringToArray = (value: string | string[] | null | undefined): string[] => {
          if (Array.isArray(value)) return value;
          if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean);
          return [];
        };

        reset({
          name: data.name,
          website: data.website || '',
          pitch_deck_url: data.pitch_deck_url || '',
          industry_focus: parseStringToArray(data.industry_focus),
          looking_for: parseStringToArray(data.looking_for),
          team_size: data.team_size || undefined,
          mission: data.mission || '',
          description: data.description || '',
        });
      } else {
        toast.error('Startup profile not found.');
      }
    } catch (e) {
      const error = e as Error;
      toast.error(`Failed to fetch startup profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [startupId, reset]);

  useEffect(() => {
    fetchStartup();
  }, [fetchStartup]);
  
  const handleSave = async (field: keyof StartupFormData) => {
    const value = getValues(field);
    console.log('--- Simulating Startup Profile Save ---');
    console.log(`Field: ${field}`);
    console.log('Value:', value);

    toast.promise(new Promise(resolve => setTimeout(resolve, 500)), {
        loading: 'Saving...',
        success: () => {
            setStartup(prev => prev ? { ...prev, [field]: value } : null);
            return 'Profile updated successfully!';
        },
        error: 'Failed to update profile.'
    });
  };

  const canEdit = user?.role === 'STARTUP_ADMIN' && user?.startup?.id === startupId;

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!startup) {
    return <div className="container mx-auto p-4">Startup not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{startup.name}</h1>
        {canEdit && (
          <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        )}
      </div>
      <StartupProfileDisplay
        startup={startup}
        isEditing={isEditing}
        onSave={handleSave}
        form={form}
        userRole={user?.role}
        canEdit={canEdit}
      />
    </div>
  );
};

export default StartupProfilePage;