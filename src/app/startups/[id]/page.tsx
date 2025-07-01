'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { getStartup, updateMyStartup } from '@/lib/api/organizations';
import { Startup, StartupUpdate } from '@/types/organization';
import { useAuthStore } from '@/store/authStore';
import { TeamSize } from '@/types/enums';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StartupProfileDisplay from '@/components/organization/StartupProfileDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Edit, Save, X } from 'lucide-react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

const startupSchema = z.object({
  name: z.string().min(1, 'Startup name is required'),
  website: z.string().url({ message: "Invalid URL" }).optional().or(z.literal('')),
  pitch_deck_url: z.string().url({ message: "Invalid URL" }).optional().or(z.literal('')),
  industry_focus: z.string().optional(),
  team_size: z.nativeEnum(TeamSize).optional(),
  mission: z.string().optional(),
  description: z.string().optional(),
});

type StartupFormData = z.infer<typeof startupSchema>;

const StartupProfilePage = () => {
  const params = useParams();
  const { user, updateUser } = useAuthStore();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const startupId = Number(params.id);

  const form = useForm<StartupFormData>({
    resolver: zodResolver(startupSchema),
    defaultValues: {},
  });

  const fetchStartup = useCallback(async () => {
    if (isNaN(startupId)) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getStartup(startupId);
      setStartup(data);
      form.reset({
        name: data.name,
        website: data.website || '',
        pitch_deck_url: data.pitch_deck_url || '',
        industry_focus: data.industry_focus || '',
        team_size: data.team_size || undefined,
        mission: data.mission || '',
        description: data.description || '',
      });
    } catch (error) {
      toast.error('Failed to fetch startup profile');
      console.error('Failed to fetch startup profile', error);
    } finally {
      setLoading(false);
    }
  }, [startupId, form]);

  useEffect(() => {
    fetchStartup();
  }, [fetchStartup]);
  
  const onSubmit = async (data: StartupFormData) => {
    const promise = updateMyStartup(data).then((updatedStartup) => {
      setStartup(updatedStartup);
      setIsEditing(false);
      if (user?.startup_id === updatedStartup.id && user.startup?.name !== updatedStartup.name) {
          const updatedUser = { ...user, startup: { ...user.startup, name: updatedStartup.name }};
          updateUser(updatedUser);
      }
    });

    toast.promise(promise, {
      loading: 'Updating profile...',
      success: 'Profile updated successfully!',
      error: 'Failed to update startup profile.',
    });
  };

  const canEdit = user?.role === 'STARTUP_ADMIN' && user?.startup_id === startupId;

  if (loading) {
    return (
        <AuthenticatedLayout>
            <div className="container mx-auto p-4">
                <Skeleton className="h-48 w-full mb-6" />
                <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-6 w-full" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
  }

  if (!startup) {
    return <AuthenticatedLayout><div className="text-center py-10">Startup not found.</div></AuthenticatedLayout>;
  }

  return (
    <AuthenticatedLayout>
        <div className="container mx-auto p-4 max-w-4xl">
             {isEditing && canEdit ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Startup Profile</CardTitle>
                        <CardDescription>Update your startup's public information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Startup Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="website" render={({ field }) => (
                           <FormItem><FormLabel>Website</FormLabel><FormControl><Input {...field} value={field.value || ''} placeholder="https://example.com" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="pitch_deck_url" render={({ field }) => (
                            <FormItem><FormLabel>Pitch Deck URL</FormLabel><FormControl><Input {...field} value={field.value || ''} placeholder="https://link-to-your-deck.com" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="industry_focus" render={({ field }) => (
                            <FormItem><FormLabel>Industry Focus</FormLabel><FormControl><Input {...field} value={field.value || ''}/></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="team_size" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Team Size</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select team size" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {Object.values(TeamSize).map((size) => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                                    </SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="mission" render={({ field }) => (
                            <FormItem><FormLabel>Mission</FormLabel><FormControl><Textarea {...field} value={field.value || ''} placeholder="Our mission is to..." /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} value={field.value || ''} placeholder="A brief description..." /></FormControl><FormMessage /></FormItem>
                        )} />

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={form.formState.isSubmitting}>
                                <X className="mr-2 h-4 w-4" /> Cancel
                            </Button>
                            <Button type="submit" disabled={!form.formState.isDirty || form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </div>
                        </form>
                    </Form>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="flex justify-end mb-4">
                        {canEdit && (
                        <Button onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Profile
                        </Button>
                        )}
                    </div>
                    <StartupProfileDisplay startup={startup} />
                </>
            )}
        </div>
    </AuthenticatedLayout>
  );
};

export default StartupProfilePage; 