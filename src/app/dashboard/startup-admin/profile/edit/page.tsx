'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getStartup, updateMyStartup } from '@/lib/api/organizations';
import { Startup, StartupUpdate } from '@/types/organization';
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
    if (user?.startup_id) {
      getStartup(user.startup_id).then(data => {
        setStartup(data);
        form.reset({
          name: data.name,
          website: data.website || '',
          pitch_deck_url: data.pitch_deck_url || '',
          industry_focus: data.industry_focus || [],
          looking_for: data.looking_for || [],
          team_size: data.team_size || undefined,
          mission: data.mission || '',
          description: data.description || '',
        });
      });
    }
  }, [user, form]);

  const onSubmit = async (data: StartupFormData) => {
    const updatePayload: StartupUpdate = { ...data };

    toast.promise(updateMyStartup(updatePayload), {
      loading: 'Updating profile...',
      success: () => {
        router.push(`/startups/${user?.startup_id}`);
        return 'Profile updated successfully!';
      },
      error: 'Failed to update profile.',
    });
  };

  const allocated = startup?.member_slots_allocated ?? 0;
  const used = startup?.member_slots_used ?? 0;
  const available = allocated - used;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Membership Status</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Allocated Slots</p>
            <p className="text-2xl font-bold">{allocated}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Used Slots</p>
            <p className="text-2xl font-bold">{used}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Available Slots</p>
            <p className="text-2xl font-bold">{available}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Edit Startup Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Startup Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Startup Name" />
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
                      <Input {...field} placeholder="https://example.com" />
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
                      <Input {...field} placeholder="https://link-to-your-deck.com" />
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
                        options={[]} // You might want to populate this with suggestions
                        onChange={field.onChange}
                        placeholder="Type and press Enter to add industries"
                        className="w-full"
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
                        options={[]} // You might want topopulate this with suggestions
                        onChange={field.onChange}
                        placeholder="Type and press Enter to add needs"
                        className="w-full"
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
                        {Object.values(TeamSize).map(size => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      <Textarea {...field} placeholder="Our mission is to..." />
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
                      <Textarea {...field} placeholder="A brief description of our startup." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={!form.formState.isDirty || form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditStartupProfilePage;