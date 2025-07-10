'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { getStartup, updateMyStartup } from '@/lib/api/organizations';
import { Startup } from '@/types/organization';
import { useAuthStore } from '@/store/authStore';
import { TeamSize } from '@/types/enums';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import StartupProfileDisplay from '@/components/organization/StartupProfileDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit } from 'lucide-react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

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
  const { user, refreshCurrentUser } = useAuthStore();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const startupId = Number(params.id);

  const form = useForm<StartupFormData>({
    resolver: zodResolver(startupSchema),
  });

  const { getValues, reset } = form;

  const fetchStartup = useCallback(async () => {
    if (isNaN(startupId)) { setLoading(false); return; }
    try {
      setLoading(true);
      const data = await getStartup(startupId);
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
    try {
      const value = getValues(field);
      const updatedStartup = await updateMyStartup({ [field]: value });
      setStartup(updatedStartup);
      toast.success('Profile updated!');
      
      // Refetch startup data to show updated info
      fetchStartup();

      // Also refresh the user's auth context if their own startup name changed
      if (user?.startup_id === startupId) {
        await refreshCurrentUser();
      }

    } catch (e) {
      const error = e as Error;
      toast.error(`Failed to update profile: ${error.message}`);
    }
  };

  const canEdit = user?.role === 'STARTUP_ADMIN' && user?.startup_id === startupId;

  if (loading) {
    return <AuthenticatedLayout><Skeleton className="h-64 w-full" /></AuthenticatedLayout>;
  }

  if (!startup) {
    return <AuthenticatedLayout><div>Startup not found.</div></AuthenticatedLayout>;
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
            <StartupProfileDisplay startup={startup} isEditing={isEditing} form={form} onSave={handleSave} />
        </div>
    </AuthenticatedLayout>
  );
};

export default StartupProfilePage;