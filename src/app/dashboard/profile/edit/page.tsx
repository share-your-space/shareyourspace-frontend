"use client";

import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { UserProfile, UserProfileUpdateRequest } from '@/types/userProfile';
import { ContactVisibility } from '@/types/enums';
import { getMyProfile, updateMyProfile, uploadMyProfilePicture } from '@/lib/api/users';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UploadCloud } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const profileFormSchema = z.object({
  title: z.string().max(100, "Title too long").optional().nullable(),
  bio: z.string().max(2000, "Bio too long").optional().nullable(),
  contact_info_visibility: z.nativeEnum(ContactVisibility).optional().nullable(),
  skills_expertise: z.array(z.string().min(1, "Skill cannot be empty").max(50, "Skill too long")).optional().nullable(),
  industry_focus: z.array(z.string().min(1, "Industry cannot be empty").max(50, "Industry too long")).optional().nullable(),
  project_interests_goals: z.string().max(1000, "Interests/goals too long").optional().nullable(),
  collaboration_preferences: z.array(z.string().min(1, "Preference cannot be empty").max(50, "Preference too long")).optional().nullable(),
  tools_technologies: z.array(z.string().min(1, "Tool/tech cannot be empty").max(50, "Tool too long")).optional().nullable(),
  linkedin_profile_url: z.string().url("Invalid URL").or(z.literal('')).optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const TagInput = ({ value: tags = [], onChange, placeholder }: { value?: string[] | null, onChange: (tags: string[]) => void, placeholder: string }) => {
    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !tags.includes(newTag)) {
                onChange([...tags, newTag]);
            }
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                    <div key={index} className="flex items-center bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-muted-foreground hover:text-foreground">
                            &times;
                        </button>
                    </div>
                ))}
            </div>
            <Input
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder={placeholder}
            />
        </div>
    );
};

export default function EditProfilePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {},
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const data = await getMyProfile();
        setProfileData(data);
        form.reset({
          title: data.title || '',
          bio: data.bio || '',
          contact_info_visibility: data.contact_info_visibility || undefined,
          skills_expertise: data.skills_expertise || [],
          industry_focus: data.industry_focus || [],
          project_interests_goals: data.project_interests_goals || '',
          collaboration_preferences: data.collaboration_preferences || [],
          tools_technologies: data.tools_technologies || [],
          linkedin_profile_url: data.linkedin_profile_url || '',
        });
        if (data.profile_picture_signed_url) {
          setPreviewImageUrl(data.profile_picture_signed_url);
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load your profile data.", variant: "destructive" });
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
      fetchProfile();
    } else if (!isLoading) { // If still loading user from store, wait. If store loaded and no user, redirect.
      // This check might need refinement depending on auth store behavior
      // router.push('/login'); 
    }
  }, [user]);
  
  const handlePictureChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      const tempUrl = URL.createObjectURL(file);
      setPreviewImageUrl(tempUrl);
      // Clean up object URL when component unmounts or file changes
      return () => URL.revokeObjectURL(tempUrl);
    }
  };

  async function onSubmit(values: ProfileFormValues) {
    if (!user) {
      toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      let currentProfile = profileData;
      if (profilePictureFile) {
        const pictureUploadResponse = await uploadMyProfilePicture(profilePictureFile);
        currentProfile = pictureUploadResponse;
        setProfileData(pictureUploadResponse);
        setPreviewImageUrl(pictureUploadResponse.profile_picture_signed_url); 
        setProfilePictureFile(null);
        toast({ title: "Success", description: "Profile picture updated!" });
      }

      const updateRequest: UserProfileUpdateRequest = {
        ...values,
        linkedin_profile_url: values.linkedin_profile_url || null,
        // Ensure array fields are always sent as arrays
        skills_expertise: values.skills_expertise || [],
        industry_focus: values.industry_focus || [],
      };      
      const response = await updateMyProfile(updateRequest);
      
      setProfileData(response);
      form.reset({
        title: response.title || '',
        bio: response.bio || '',
        contact_info_visibility: response.contact_info_visibility || undefined,
        skills_expertise: response.skills_expertise || [],
        industry_focus: response.industry_focus || [],
        project_interests_goals: response.project_interests_goals || '',
        collaboration_preferences: response.collaboration_preferences || [],
        tools_technologies: response.tools_technologies || [],
        linkedin_profile_url: response.linkedin_profile_url || '',
      });
      if (response.profile_picture_signed_url) { // Ensure preview is updated if only text was changed but pic exists
          setPreviewImageUrl(response.profile_picture_signed_url);
      }

      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
      router.push(`/dashboard/users/${user.id}`);
    } catch (error: any) {
      const msg = error.response?.data?.detail || error.message || "Failed to update profile.";
      toast({ title: "Update Failed", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || !user && isLoading) { // Show loading if initial user or profile fetch is in progress
    return <div className="container mx-auto p-4 flex justify-center items-center min-h-screen"><p>Loading profile editor...</p></div>;
  }
  if (!user && !isLoading) { // If loading finished and still no user, likely an auth issue
     router.push('/login'); // Or a more graceful handling
     return <div className="container mx-auto p-4 flex justify-center items-center min-h-screen"><p>Redirecting to login...</p></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
      </Button>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Your Profile</CardTitle>
          <CardDescription>Update your personal and professional information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormItem>
                <FormLabel>Profile Picture</FormLabel>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-24 w-24 border">
                    <AvatarImage src={previewImageUrl || undefined} alt="Profile Preview" />
                    <AvatarFallback><UploadCloud /></AvatarFallback>
                  </Avatar>
                  <FormControl>
                     <Input type="file" accept="image/*" onChange={handlePictureChange} className="max-w-xs"/>
                  </FormControl>
                </div>
                <FormMessage /> 
              </FormItem>

              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title / Headline</FormLabel>
                  <FormControl><Input placeholder="e.g., Software Engineer, Founder" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="bio" render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio / About Me</FormLabel>
                  <FormControl><Textarea placeholder="Tell us a bit about yourself..." {...field} value={field.value || ''} rows={5} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="skills_expertise" render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills & Expertise</FormLabel>
                  <FormControl><TagInput value={field.value} onChange={field.onChange} placeholder="Add a skill and press Enter..."/></FormControl>
                  <FormDescription>Enter a skill and press Enter or comma to add it as a tag.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="industry_focus" render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry Focus</FormLabel>
                   <FormControl><TagInput value={field.value} onChange={field.onChange} placeholder="Add an industry and press Enter..."/></FormControl>
                   <FormDescription>Enter an industry and press Enter or comma to add it as a tag.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="tools_technologies" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tools & Technologies</FormLabel>
                  <FormControl><TagInput value={field.value} onChange={field.onChange} placeholder="Add a tool and press Enter..."/></FormControl>
                  <FormDescription>Enter a tool/tech and press Enter or comma to add it as a tag.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="project_interests_goals" render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Interests & Goals</FormLabel>
                  <FormControl><Textarea placeholder="What are you passionate about?" {...field} value={field.value || ''} rows={3}/></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="collaboration_preferences" render={({ field }) => (
                <FormItem>
                  <FormLabel>Collaboration Preferences</FormLabel>
                  <FormControl><TagInput value={field.value} onChange={field.onChange} placeholder="Add a preference and press Enter..."/></FormControl>
                  <FormDescription>How do you like to collaborate? Add tags by pressing Enter or comma.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="linkedin_profile_url" render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn Profile URL</FormLabel>
                  <FormControl><Input placeholder="https://linkedin.com/in/yourprofile" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="contact_info_visibility" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Info Visibility</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined} defaultValue={field.value || undefined}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select visibility" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {Object.values(ContactVisibility).map(val => (
                        <SelectItem key={val} value={val}>{val.charAt(0).toUpperCase() + val.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Who can see your contact details?</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              
              <Button type="submit" disabled={isSubmitting || isLoading} className="w-full md:w-auto">
                {isSubmitting ? "Saving Profile..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 