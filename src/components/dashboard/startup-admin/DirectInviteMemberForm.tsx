"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { getMyStartup } from '@/lib/api/organizations';
import { StartupDirectInviteCreate } from '@/types/auth';
import { Startup } from '@/types/organization';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  full_name: z.string().optional(),
});

interface DirectInviteMemberFormProps {
  onInvitationSent: () => void;
}

const DirectInviteMemberForm = ({ onInvitationSent }: DirectInviteMemberFormProps) => {
  const { user } = useAuthStore();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      full_name: "",
    },
  });

  useEffect(() => {
    const fetchMyStartup = async () => {
      setIsLoading(true);
      try {
        const startupData = await getMyStartup();
        setStartup(startupData);
      } catch (error) {
        console.error("Failed to fetch startup data:", error);
        toast.error("Error", {
          description: "Could not load your startup details. Please try refreshing.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyStartup();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Simulate sending an invitation
    console.log('Simulating invitation for:', {
      email: values.email,
      entityId: user?.startup_id,
      role: 'STARTUP_MEMBER', // Mock role
    });

    toast.success("Invitation Sent", {
      description: `An invitation has been sent to ${values.email}.`,
    });
    form.reset();
    onInvitationSent(); // This will refetch the list of members/invitations on the parent dashboard
  }
  
  const allocated = startup?.member_slots_allocated ?? 0;
  const used = startup?.member_slots_used ?? 0;
  const available = allocated - used;

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading recruitment info...</span>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">
        You have {available} of {allocated} slots available.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input placeholder="member@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Alex Doe" {...field} onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)} />
                </FormControl>
                <FormDescription>
                  Providing a full name can help them get started faster.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting || available <= 0}>
            {isSubmitting ? "Sending..." : "Send Invitation"}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default DirectInviteMemberForm;