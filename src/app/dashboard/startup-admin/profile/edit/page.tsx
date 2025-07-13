'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Startup } from '@/types/organization';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { TeamSize } from '@/types/enums';
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

const EditStartupProfilePage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [startup, setStartup] = useState<Startup | null>(null);
  const form = useForm<StartupFormData>({
    resolver: zodResolver(startupSchema),
    defaultValues: {
      name: '',
      website: '',
      pitch_deck_url: '',
      industry_focus: [],
      looking_for: [],
      team_size: undefined,
      mission: '',
      description: '',
    },
  });

  useEffect(() => {
    if (user?.startup?.id) {
      const startupData = mockStartups.find(s => s.id === user.startup!.id);
      if (startupData) {
        setStartup(startupData as Startup);

        const parseStringToArray = (value: string | string[] | null | undefined): string[] => {
          if (Array.isArray(value)) return value;
          if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean);
          return [];
        };

        form.reset({
          name: startupData.name,
          website: startupData.website || '',
          pitch_deck_url: (startupData as Startup).pitch_deck_url || '',
          industry_focus: parseStringToArray(startupData.industry_focus),
          looking_for: parseStringToArray(startupData.looking_for),
          team_size: (startupData as Startup).team_size || undefined,
          mission: (startupData as Startup).mission || '',
          description: startupData.description || '',
        });
      }
    }
  }, [user, form]);

  const onSubmit = async (data: StartupFormData) => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), {
      loading: 'Updating profile...',
      success: () => {
        // Here you would typically update the mock data if you want changes to persist across the session
        console.log("Updated startup data (simulation):", data);
        router.push(`/startups/${user?.startup?.id}`);
        return 'Profile updated successfully!';
      },
      error: 'Failed to update profile.',
    });
  };

  if (!startup) {
    return <div>Loading startup profile...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Startup Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Startup Name</FormLabel>
                  <FormControl>
                    <Input placeholder="QuantumLeap AI" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://quantumleap.ai" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pitch_deck_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pitch Deck URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/pitch" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A short description of your startup." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mission</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Your startup's mission." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="industry_focus"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Industry Focus</FormLabel>
                        <FormControl>
                            <MultiSelect
                                selected={field.value || []}
                                options={[
                                    { label: "AI", value: "AI" },
                                    { label: "SaaS", value: "SaaS" },
                                    { label: "FinTech", value: "FinTech" },
                                    { label: "HealthTech", value: "HealthTech" },
                                ]}
                                onChange={field.onChange}
                                placeholder="Select industries"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="looking_for"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Looking For</FormLabel>
                        <FormControl>
                            <MultiSelect
                                selected={field.value || []}
                                options={[
                                    { label: "Software Engineers", value: "Software Engineers" },
                                    { label: "Data Scientists", value: "Data Scientists" },
                                    { label: "Marketing Experts", value: "Marketing Experts" },
                                    { label: "Sales Representatives", value: "Sales Representatives" },
                                ]}
                                onChange={field.onChange}
                                placeholder="Select roles"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="team_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Size</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(TeamSize).map((size) => (
                        <SelectItem key={size} value={size}>
                          {size.replace('_', '-')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EditStartupProfilePage;